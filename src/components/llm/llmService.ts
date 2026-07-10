import type { LLMSettings, WellnessRecommendation, ViralPost } from '../../types'
import { v4 as uuidv4 } from 'uuid'

// The deployed Cloudflare Worker that proxies LLM calls (handles browser CORS and
// translates Anthropic's native API). Set at build time via VITE_LLM_PROXY_URL.
// When empty we fall back to calling the provider directly (works in Electron and
// for OpenAI-compatible providers in the browser).
const PROXY_URL = (import.meta.env.VITE_LLM_PROXY_URL as string | undefined)?.replace(/\/$/, '') || ''

type Provider = 'openai' | 'anthropic' | 'google' | 'custom'

function providerOf(model: string): Provider {
  if (model.startsWith('claude')) return 'anthropic'
  if (model.startsWith('gemini')) return 'google'
  if (model === 'custom') return 'custom'
  return 'openai'
}

// ─── Base LLM Call ────────────────────────────────────────────────────────────

async function callLLM(settings: LLMSettings, systemPrompt: string, userMessage: string): Promise<string> {
  const { model, apiKey, customEndpoint, temperature, maxTokens } = settings
  const provider = providerOf(model)

  const body = JSON.stringify({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature,
    max_tokens: maxTokens,
  })

  let response: Response

  if (PROXY_URL) {
    // Route through our Worker. The user's key travels in x-llm-key and is
    // forwarded to the provider, never stored.
    response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-llm-provider': provider,
        'x-llm-key': apiKey,
        ...(customEndpoint ? { 'x-llm-base': customEndpoint } : {}),
      },
      body,
    })
  } else {
    // Direct fallback (no proxy configured).
    let baseURL = 'https://api.openai.com/v1'
    if (provider === 'google') {
      baseURL = customEndpoint || 'https://generativelanguage.googleapis.com/v1beta/openai'
    } else if (provider === 'custom' && customEndpoint) {
      baseURL = customEndpoint
    } else if (provider === 'anthropic') {
      baseURL = customEndpoint || 'https://api.anthropic.com/v1'
    }
    response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(provider === 'anthropic' ? { 'anthropic-dangerous-direct-browser-access': 'true' } : {}),
      },
      body,
    })
  }

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`LLM API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// ─── Category-Specific Generators ─────────────────────────────────────────────

export async function generateProjectPlan(settings: LLMSettings, projectName: string, description: string, customPrompt?: string): Promise<string> {
  const system = `You are an expert project manager and productivity coach. ${settings.categoryPrompts.projects}`
  const user = customPrompt
    ? `${customPrompt}\n\nProject: ${projectName}\nDescription: ${description}`
    : `Create a detailed project plan for: "${projectName}"\nDescription: ${description}\n\nProvide: 1) Key milestones, 2) Task breakdown, 3) Potential risks, 4) Success metrics. Format clearly with sections.`
  return callLLM(settings, system, user)
}

export async function generateTaskBreakdown(settings: LLMSettings, taskTitle: string, description: string, customPrompt?: string): Promise<string> {
  const system = `You are a productivity expert who helps break down complex tasks into actionable steps. ${settings.categoryPrompts.tasks}`
  const user = customPrompt
    ? `${customPrompt}\n\nTask: ${taskTitle}\nDescription: ${description}`
    : `Break down this task into clear, actionable subtasks:\n\nTask: "${taskTitle}"\nDescription: ${description}\n\nProvide 3-7 specific subtasks with estimated time for each.`
  return callLLM(settings, system, user)
}

export async function generateTimeBlockSchedule(settings: LLMSettings, tasks: string[], workingHours: string, customPrompt?: string): Promise<string> {
  const system = `You are a time management expert specializing in deep work and flow states. ${settings.categoryPrompts.timeblock}`
  const user = customPrompt
    ? `${customPrompt}\n\nTasks: ${tasks.join(', ')}\nWorking hours: ${workingHours}`
    : `Create an optimal time-blocked schedule for today.\n\nTasks to complete: ${tasks.join(', ')}\nWorking hours: ${workingHours}\n\nProvide specific time blocks with rationale for sequencing. Include breaks and transition time.`
  return callLLM(settings, system, user)
}

export async function generateTimeline(settings: LLMSettings, projectName: string, tasks: string[], deadline: string, customPrompt?: string): Promise<string> {
  const system = `You are a project timeline expert who creates realistic, buffer-conscious schedules. ${settings.categoryPrompts.timeline}`
  const user = customPrompt
    ? `${customPrompt}\n\nProject: ${projectName}, Deadline: ${deadline}, Tasks: ${tasks.join(', ')}`
    : `Create a realistic project timeline for: "${projectName}"\nDeadline: ${deadline}\nKey tasks: ${tasks.join(', ')}\n\nProvide week-by-week milestones with dependencies and 20% buffer time built in.`
  return callLLM(settings, system, user)
}

export async function generateWellnessRecommendations(settings: LLMSettings, date: string): Promise<WellnessRecommendation[]> {
  const system = `You are a holistic wellness coach and health optimization expert. ${settings.categoryPrompts.health}`
  const user = `Generate 10-12 personalized daily wellness recommendations for ${date}. 
  
  Return ONLY a valid JSON array with this exact structure:
  [{"category": "morning|nutrition|movement|mindset|evening|productivity", "title": "string", "description": "string (2-3 sentences with science-backed rationale)", "duration": "string", "priority": "high|medium|low"}]
  
  Cover: morning routine, nutrition, movement, mindset, evening wind-down, and productivity optimization.`

  try {
    const raw = await callLLM(settings, system, user)
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')
    const parsed = JSON.parse(jsonMatch[0])
    return parsed.map((r: any) => ({
      ...r,
      id: uuidv4(),
      date,
      completed: false,
    }))
  } catch {
    throw new Error('Failed to parse wellness recommendations')
  }
}

export async function summarizeEmail(settings: LLMSettings, emailContent: string, customPrompt?: string): Promise<string> {
  const system = `You are an executive assistant who triages emails efficiently. ${settings.categoryPrompts.emails}`
  const user = customPrompt
    ? `${customPrompt}\n\nEmail:\n${emailContent}`
    : `Summarize this email in 2-3 sentences. Identify: 1) Action required (yes/no), 2) Urgency (high/medium/low), 3) Key information.\n\nEmail:\n${emailContent}`
  return callLLM(settings, system, user)
}

export async function summarizeNewsletter(settings: LLMSettings, content: string, customPrompt?: string): Promise<string> {
  const system = `You are a content curator who extracts maximum value from newsletters. ${settings.categoryPrompts.newsletters}`
  const user = customPrompt
    ? `${customPrompt}\n\nContent:\n${content}`
    : `Extract the 3-5 most valuable insights from this newsletter. For each insight: provide a one-line title and 2-sentence explanation of why it matters and how to apply it.\n\nContent:\n${content.substring(0, 3000)}`
  return callLLM(settings, system, user)
}

export async function generateViralPost(
  settings: LLMSettings,
  platform: ViralPost['platform'],
  topic: string,
  tone: ViralPost['tone'],
  customPrompt?: string
): Promise<{ content: string; hook: string; hashtags: string[] }> {
  const platformGuides: Record<ViralPost['platform'], string> = {
    twitter: 'Under 280 characters. Punchy, opinionated, conversational. Use line breaks for impact.',
    linkedin: '150-300 words. Professional but personal. Start with a bold statement. Use line breaks. End with a question.',
    instagram: '100-150 words. Inspirational, visual storytelling. Use emojis strategically. Strong CTA.',
    threads: 'Under 500 characters. Conversational, authentic, slightly casual. Like a tweet but more personal.',
    facebook: '50-100 words. Conversational, community-focused. Ask for engagement.',
  }

  const system = `You are a viral content strategist who creates platform-optimized posts that drive massive engagement. ${settings.categoryPrompts.viralPosts}`
  const user = customPrompt
    ? `${customPrompt}\n\nPlatform: ${platform}, Topic: ${topic}, Tone: ${tone}`
    : `Create a viral ${platform} post about: "${topic}"\nTone: ${tone}\nPlatform guide: ${platformGuides[platform]}\n\nReturn ONLY valid JSON: {"content": "full post text", "hook": "opening hook line", "hashtags": ["tag1", "tag2", "tag3"]}`

  let rawResult = ''
  try {
    rawResult = await callLLM(settings, system, user)
    const jsonMatch = rawResult.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    return JSON.parse(jsonMatch[0])
  } catch {
    return {
      content: rawResult,
      hook: rawResult.split('\n')[0] || '',
      hashtags: [],
    }
  }
}

export async function generateGenericResponse(settings: LLMSettings, category: string, context: string, customPrompt: string): Promise<string> {
  const categoryPrompt = settings.categoryPrompts[category as keyof typeof settings.categoryPrompts] || ''
  const system = `You are a productivity and life optimization AI assistant. ${categoryPrompt}`
  const user = `${customPrompt}\n\nContext: ${context}`
  return callLLM(settings, system, user)
}
