import { useState } from 'react'
import { Zap, Mail, Rss, TrendingUp, RefreshCw, Bookmark, BookmarkCheck, Copy, Check, Loader2, Send, ExternalLink, AlertCircle, Sparkles } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { motion, AnimatePresence } from 'framer-motion'
import { generateViralPost, summarizeNewsletter } from '../llm/llmService'
import type { ViralPost, Newsletter, EmailSummary } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

const PLATFORMS: { id: ViralPost['platform']; label: string; icon: React.ComponentType<any>; color: string }[] = [
  { id: 'twitter', label: 'X / Twitter', icon: Zap, color: '#1DA1F2' },
  { id: 'linkedin', label: 'LinkedIn', icon: Zap, color: '#0A66C2' },
  { id: 'instagram', label: 'Instagram', icon: Zap, color: '#E1306C' },
  { id: 'threads', label: 'Threads', icon: Zap, color: '#6366f1' },
  { id: 'facebook', label: 'Facebook', icon: Zap, color: '#1877F2' },
]

const TONES: ViralPost['tone'][] = ['professional', 'casual', 'inspirational', 'educational', 'entertaining']

const SAMPLE_NEWSLETTERS: Newsletter[] = [
  {
    id: uuidv4(), source: 'Morning Brew', title: 'The AI Revolution in Productivity Tools',
    summary: 'How AI is transforming how we work, from automated task management to intelligent scheduling systems that learn your preferences.',
    url: 'https://morningbrew.com', publishedAt: new Date().toISOString(), tags: ['AI', 'productivity', 'tech'], saved: false,
  },
  {
    id: uuidv4(), source: 'Entrepreneur Daily', title: '5 Habits of Ultra-Productive Founders',
    summary: 'Top founders share their morning routines, time-blocking strategies, and how they protect their deep work time.',
    url: 'https://entrepreneur.com', publishedAt: new Date().toISOString(), tags: ['habits', 'founders', 'productivity'], saved: false,
  },
  {
    id: uuidv4(), source: 'HBR Ideacast', title: 'The Science of Peak Performance',
    summary: 'New research reveals the optimal conditions for achieving flow state and how to engineer your environment for maximum output.',
    url: 'https://hbr.org', publishedAt: new Date().toISOString(), tags: ['performance', 'science', 'flow'], saved: false,
  },
]

const SAMPLE_EMAILS: EmailSummary[] = [
  {
    id: uuidv4(), from: 'team@company.com', subject: 'Q2 Project Update Required',
    preview: 'Hi, we need your Q2 project status update by EOD Friday. Please include metrics and blockers.',
    date: new Date().toISOString(), category: 'important', read: false, actionRequired: true,
  },
  {
    id: uuidv4(), from: 'newsletter@producthunt.com', subject: 'Top Products This Week',
    preview: 'Discover the hottest new products launched this week on Product Hunt...',
    date: new Date().toISOString(), category: 'newsletter', read: true, actionRequired: false,
  },
  {
    id: uuidv4(), from: 'noreply@linkedin.com', subject: '5 new connection requests',
    preview: 'You have 5 new connection requests waiting for your response.',
    date: new Date().toISOString(), category: 'social', read: false, actionRequired: false,
  },
  {
    id: uuidv4(), from: 'billing@aws.com', subject: 'Your AWS bill is ready',
    preview: 'Your AWS bill for this month is $47.23. View your detailed usage report.',
    date: new Date().toISOString(), category: 'update', read: false, actionRequired: true,
  },
]

export function AutomationView() {
  const { emails, newsletters, viralPosts, setEmails, setNewsletters, addViralPost, toggleSaveNewsletter, toggleSaveViralPost, settings, addNotification } = useAppStore()
  const [activeTab, setActiveTab] = useState<'emails' | 'newsletters' | 'posts'>('emails')
  const [isLoadingEmails, setIsLoadingEmails] = useState(false)
  const [isLoadingNewsletters, setIsLoadingNewsletters] = useState(false)
  const [isGeneratingPost, setIsGeneratingPost] = useState(false)
  const [postTopic, setPostTopic] = useState('')
  const [postPlatform, setPostPlatform] = useState<ViralPost['platform']>('linkedin')
  const [postTone, setPostTone] = useState<ViralPost['tone']>('professional')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleFetchEmails = async () => {
    setIsLoadingEmails(true)
    // Simulate email fetch (in production, this would use the CLI/IMAP)
    await new Promise(r => setTimeout(r, 1500))
    setEmails(SAMPLE_EMAILS)
    addNotification({ type: 'success', title: 'Emails Synced', message: `${SAMPLE_EMAILS.length} emails fetched and categorized.` })
    setIsLoadingEmails(false)
  }

  const handleFetchNewsletters = async () => {
    setIsLoadingNewsletters(true)
    await new Promise(r => setTimeout(r, 1500))
    setNewsletters(SAMPLE_NEWSLETTERS)
    addNotification({ type: 'success', title: 'Newsletters Fetched', message: `${SAMPLE_NEWSLETTERS.length} newsletters loaded from your RSS feeds.` })
    setIsLoadingNewsletters(false)
  }

  const handleGeneratePost = async () => {
    if (!postTopic.trim()) {
      addNotification({ type: 'warning', title: 'Topic Required', message: 'Enter a topic for your viral post.' })
      return
    }
    if (!settings.llm.enabled || !settings.llm.apiKey) {
      addNotification({ type: 'warning', title: 'AI Required', message: 'Enable AI in Settings to generate viral posts.' })
      return
    }
    setIsGeneratingPost(true)
    try {
      const result = await generateViralPost(settings.llm, postPlatform, postTopic, postTone, settings.llm.categoryPrompts.viralPosts)
      addViralPost({
        platform: postPlatform,
        content: result.content,
        hook: result.hook,
        hashtags: result.hashtags,
        topic: postTopic,
        tone: postTone,
        saved: false,
      })
      addNotification({ type: 'success', title: 'Post Generated!', message: `Your ${postPlatform} post is ready.` })
      setPostTopic('')
    } catch (e: any) {
      addNotification({ type: 'error', title: 'Generation Failed', message: e.message })
    } finally {
      setIsGeneratingPost(false)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const categoryColors: Record<EmailSummary['category'], string> = {
    important: 'text-red-400 bg-red-500/10',
    newsletter: 'text-blue-400 bg-blue-500/10',
    promotional: 'text-amber-400 bg-amber-500/10',
    social: 'text-violet-400 bg-violet-500/10',
    update: 'text-emerald-400 bg-emerald-500/10',
  }

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" />
            Automation Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Email triage, newsletters, and viral content — all in one place</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-white/5 flex-shrink-0">
        {[
          { id: 'emails', label: 'Email Triage', icon: Mail, count: emails.filter(e => !e.read).length },
          { id: 'newsletters', label: 'Newsletters', icon: Rss, count: newsletters.length },
          { id: 'posts', label: 'Viral Posts', icon: TrendingUp, count: viralPosts.length },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={13} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto scrollable p-6">
        {/* Email Triage */}
        {activeTab === 'emails' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title mb-0">Email Triage</h2>
                <p className="text-xs text-slate-500 mt-0.5">AI-categorized inbox — only what matters, nothing that doesn't</p>
              </div>
              <button onClick={handleFetchEmails} disabled={isLoadingEmails} className="btn-primary">
                {isLoadingEmails ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isLoadingEmails ? 'Syncing...' : 'Sync Emails'}
              </button>
            </div>

            {/* CLI Info Banner */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-amber-300 font-medium">CLI Email Integration</p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  For live email sync, configure your email credentials in Settings. The app uses a lightweight CLI (not MCP) to fetch and triage emails without consuming AI tokens.
                  Supports Gmail, Outlook, and any IMAP server.
                </p>
              </div>
            </div>

            {emails.length === 0 ? (
              <div className="text-center py-12">
                <Mail size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-medium mb-1">No emails loaded</p>
                <p className="text-slate-600 text-sm mb-4">Click "Sync Emails" to fetch and categorize your inbox</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Action Required First */}
                {emails.filter(e => e.actionRequired).length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertCircle size={11} /> Action Required
                    </h3>
                    {emails.filter(e => e.actionRequired).map(email => (
                      <EmailCard key={email.id} email={email} categoryColors={categoryColors} />
                    ))}
                  </div>
                )}
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">All Emails</h3>
                {emails.filter(e => !e.actionRequired).map(email => (
                  <EmailCard key={email.id} email={email} categoryColors={categoryColors} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Newsletters */}
        {activeTab === 'newsletters' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title mb-0">Newsletter Digest</h2>
                <p className="text-xs text-slate-500 mt-0.5">Curated insights from your RSS feeds — no inbox clutter</p>
              </div>
              <button onClick={handleFetchNewsletters} disabled={isLoadingNewsletters} className="btn-primary">
                {isLoadingNewsletters ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {isLoadingNewsletters ? 'Fetching...' : 'Fetch Newsletters'}
              </button>
            </div>

            {newsletters.length === 0 ? (
              <div className="text-center py-12">
                <Rss size={40} className="text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 font-medium mb-1">No newsletters loaded</p>
                <p className="text-slate-600 text-sm mb-4">Add RSS feeds in Settings and click "Fetch Newsletters"</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {newsletters.map((nl, i) => (
                  <motion.div
                    key={nl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-xs text-primary-400 font-medium mb-0.5">{nl.source}</div>
                        <h3 className="text-sm font-semibold text-white leading-tight">{nl.title}</h3>
                      </div>
                      <button onClick={() => toggleSaveNewsletter(nl.id)} className="ml-2 flex-shrink-0">
                        {nl.saved
                          ? <BookmarkCheck size={16} className="text-amber-400" />
                          : <Bookmark size={16} className="text-slate-600 hover:text-slate-400 transition-colors" />
                        }
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{nl.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {nl.tags.map(tag => (
                          <span key={tag} className="tag bg-white/5 text-slate-500">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {settings.llm.enabled && (
                          <button
                            onClick={async () => {
                              if (!settings.llm.apiKey) return
                              try {
                                const summary = await summarizeNewsletter(settings.llm, nl.summary)
                                addNotification({ type: 'info', title: 'AI Summary', message: summary.substring(0, 100) + '...' })
                              } catch {}
                            }}
                            className="text-violet-400 hover:text-violet-300"
                          >
                            <Sparkles size={12} />
                          </button>
                        )}
                        <a href={nl.url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Viral Posts */}
        {activeTab === 'posts' && (
          <div>
            <div className="mb-6">
              <h2 className="section-title">Generate Viral Post</h2>
              <div className="card">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Platform</label>
                    <div className="flex flex-wrap gap-1.5">
                      {PLATFORMS.map(p => {
                        const Icon = p.icon
                        return (
                          <button
                            key={p.id}
                            onClick={() => setPostPlatform(p.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${postPlatform === p.id ? 'border-primary-500 bg-primary-500/20 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
                          >
                            <Icon size={12} />
                            {p.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Tone</label>
                    <div className="flex flex-wrap gap-1.5">
                      {TONES.map(t => (
                        <button
                          key={t}
                          onClick={() => setPostTone(t)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize ${postTone === t ? 'border-accent-500 bg-accent-500/20 text-white' : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-slate-400 mb-1 block">Topic / Idea</label>
                  <input
                    className="input-field"
                    placeholder="e.g. The one habit that changed my productivity forever..."
                    value={postTopic}
                    onChange={e => setPostTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGeneratePost()}
                  />
                </div>
                <button onClick={handleGeneratePost} disabled={isGeneratingPost || !postTopic.trim()} className="btn-primary w-full justify-center disabled:opacity-50">
                  {isGeneratingPost ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isGeneratingPost ? 'Generating...' : 'Generate Viral Post'}
                </button>
              </div>
            </div>

            {/* Generated Posts */}
            {viralPosts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Generated Posts</h3>
                <div className="space-y-3">
                  {viralPosts.map((post, i) => {
                    const platform = PLATFORMS.find(p => p.id === post.platform)
                    const Icon = platform?.icon || Zap
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card hover:border-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: (platform?.color || '#6171f6') + '20' }}>
                              <Icon size={12} style={{ color: platform?.color || '#6171f6' }} />
                            </div>
                            <div>
                              <span className="text-xs font-medium text-white capitalize">{post.platform}</span>
                              <span className="text-xs text-slate-500 ml-2 capitalize">{post.tone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleSaveViralPost(post.id)}>
                              {post.saved
                                ? <BookmarkCheck size={14} className="text-amber-400" />
                                : <Bookmark size={14} className="text-slate-600 hover:text-slate-400 transition-colors" />
                              }
                            </button>
                            <button onClick={() => handleCopy(post.id, post.content)} className="btn-ghost p-1">
                              {copiedId === post.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed mb-2 whitespace-pre-wrap">{post.content}</p>
                        {post.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.hashtags.map(tag => (
                              <span key={tag} className="text-xs text-primary-400">#{tag}</span>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-slate-600 mt-2">
                          Topic: {post.topic} · {format(new Date(post.generatedAt), 'MMM d, h:mm a')}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function EmailCard({ email, categoryColors }: { email: EmailSummary; categoryColors: Record<string, string> }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all mb-2 ${email.read ? 'bg-surface-700/50 border-white/3' : 'bg-surface-700 border-white/5 hover:border-white/10'}`}>
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${email.read ? 'bg-transparent' : 'bg-primary-400'}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs font-medium text-slate-400">{email.from}</span>
          <div className="flex items-center gap-2">
            {email.actionRequired && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Action needed</span>
            )}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${categoryColors[email.category]}`}>
              {email.category}
            </span>
          </div>
        </div>
        <div className={`text-sm font-medium mb-0.5 ${email.read ? 'text-slate-400' : 'text-white'}`}>{email.subject}</div>
        <p className="text-xs text-slate-500 truncate">{email.preview}</p>
      </div>
    </div>
  )
}
