/**
 * PT Time Block Timeline — LLM proxy (Cloudflare Worker)
 *
 * Why this exists:
 *  - Browsers block direct calls to LLM providers (CORS), and we never want a
 *    shared key baked into client code.
 *  - This Worker is a thin, stateless router. The USER's own API key arrives in
 *    the `x-llm-key` header on each request, is forwarded to the chosen provider,
 *    and is never logged or stored.
 *  - It also normalizes Anthropic's native Messages API into the OpenAI
 *    chat-completions response shape the app already understands.
 *
 * Request (POST):
 *   headers:
 *     x-llm-provider: openai | anthropic | google | custom
 *     x-llm-key:      <the user's API key>
 *     x-llm-base:     <base URL>  (required only for provider=custom)
 *   body (OpenAI chat-completions shape):
 *     { model, messages:[{role,content}], temperature, max_tokens }
 *
 * Response: OpenAI chat-completions shape → { choices:[{ message:{ content } }] }
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-llm-provider, x-llm-key, x-llm-base',
  'Access-Control-Max-Age': '86400',
}

// Map the app's internal model ids to real provider model names.
const ANTHROPIC_MODELS: Record<string, string> = {
  'claude-3-5-sonnet': 'claude-3-5-sonnet-latest',
  'claude-3-haiku': 'claude-3-haiku-20240307',
}

const ANTHROPIC_VERSION = '2023-06-01'

interface ChatBody {
  model: string
  messages: { role: string; content: string }[]
  temperature?: number
  max_tokens?: number
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

    const provider = (request.headers.get('x-llm-provider') || 'openai').toLowerCase()
    const key = request.headers.get('x-llm-key') || ''
    const base = request.headers.get('x-llm-base') || ''

    if (!key) return json({ error: 'Missing API key (x-llm-key header).' }, 400)

    let body: ChatBody
    try {
      body = (await request.json()) as ChatBody
    } catch {
      return json({ error: 'Invalid JSON body.' }, 400)
    }

    try {
      if (provider === 'anthropic') {
        return await callAnthropic(body, key)
      }
      // openai, google, and custom are all OpenAI-compatible chat/completions.
      const baseURL =
        provider === 'google'
          ? 'https://generativelanguage.googleapis.com/v1beta/openai'
          : provider === 'custom'
          ? base.replace(/\/$/, '')
          : 'https://api.openai.com/v1'

      if (provider === 'custom' && !baseURL) {
        return json({ error: 'Custom provider requires x-llm-base header.' }, 400)
      }

      const upstream = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(body),
      })

      const text = await upstream.text()
      return new Response(text, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', ...CORS },
      })
    } catch (e: any) {
      return json({ error: `Proxy error: ${e?.message || String(e)}` }, 502)
    }
  },
}

async function callAnthropic(body: ChatBody, key: string): Promise<Response> {
  const model = ANTHROPIC_MODELS[body.model] || body.model
  const system = body.messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n')
  const messages = body.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      system: system || undefined,
      messages,
      max_tokens: body.max_tokens ?? 1024,
      temperature: body.temperature ?? 0.7,
    }),
  })

  if (!upstream.ok) {
    const errText = await upstream.text()
    return new Response(errText, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...CORS },
    })
  }

  const data: any = await upstream.json()
  const content = Array.isArray(data?.content)
    ? data.content.map((p: any) => p?.text || '').join('')
    : ''

  // Normalize to OpenAI chat-completions shape.
  return json({ choices: [{ message: { role: 'assistant', content } }] })
}
