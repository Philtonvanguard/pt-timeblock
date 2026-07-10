import { useRef, useState } from 'react'
import { Settings, Sparkles, Mail, Rss, Bell, Palette, Save, Eye, EyeOff, Plus, Trash2, CheckCircle2, Info, HardDrive, Download, Upload, AlertTriangle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { isWeb } from '../../lib/platform'
import { motion } from 'framer-motion'
import type { LLMModel } from '../../types'

const LLM_MODELS: { id: LLMModel; label: string; provider: string }[] = [
  { id: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'claude-3-haiku', label: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'custom', label: 'Custom / Local', provider: 'Custom' },
]

const CATEGORY_LABELS: Record<string, string> = {
  projects: 'Projects',
  tasks: 'Tasks',
  timeblock: 'Time Blocking',
  timeline: 'Timeline',
  health: 'Health Pro',
  emails: 'Email Triage',
  newsletters: 'Newsletters',
  viralPosts: 'Viral Posts',
  visionboard: 'Vision Board',
}

export function SettingsView() {
  const { settings, updateSettings, updateLLMSettings, addNotification, exportData, importData, clearAllData } = useAppStore()
  const [activeSection, setActiveSection] = useState('ai')
  const [showApiKey, setShowApiKey] = useState(false)
  const [newFeed, setNewFeed] = useState('')
  const [saved, setSaved] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pt-timeblock-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addNotification({ type: 'success', title: 'Backup Exported', message: 'Your data was downloaded as a JSON file.' })
  }

  const handleImportFile = async (file: File) => {
    const text = await file.text()
    if (importData(text)) {
      addNotification({ type: 'success', title: 'Backup Imported', message: 'Your data was restored from the backup file.' })
    } else {
      addNotification({ type: 'error', title: 'Import Failed', message: 'That file is not a valid PT Time Block backup.' })
    }
  }

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 5000)
      return
    }
    clearAllData()
    setConfirmClear(false)
    addNotification({ type: 'success', title: 'Data Cleared', message: 'All app data was removed from this device.' })
  }

  const handleSave = () => {
    setSaved(true)
    addNotification({ type: 'success', title: 'Settings Saved', message: 'Your preferences have been updated.' })
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    { id: 'ai', label: 'AI Configuration', icon: Sparkles },
    { id: 'prompts', label: 'Category Prompts', icon: Sparkles },
    // Email & RSS triage is a desktop-only feature; hide it on the web build.
    ...(isWeb ? [] : [{ id: 'email', label: 'Email & RSS', icon: Mail }]),
    { id: 'data', label: 'Data & Storage', icon: HardDrive },
    { id: 'general', label: 'General', icon: Settings },
  ]

  return (
    <div className="h-full flex flex-col lg:flex-row bg-surface-900">
      {/* Settings Sidebar */}
      <div className="lg:w-52 border-b lg:border-b-0 lg:border-r border-white/5 p-4 flex-shrink-0">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Settings size={16} className="text-slate-400" />
          Settings
        </h2>
        <nav className="flex lg:flex-col gap-1 overflow-x-auto scrollable">
          {sections.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`nav-item w-auto lg:w-full shrink-0 whitespace-nowrap ${activeSection === s.id ? 'active' : ''}`}
              >
                <Icon size={15} />
                {s.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto scrollable p-6">
        {/* AI Configuration */}
        {activeSection === 'ai' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="section-title">AI Configuration</h2>
            <p className="text-sm text-slate-500 mb-6">Configure your LLM provider to enable AI-powered features across all modules. Your API key is stored locally and never sent to our servers.</p>

            <div className="space-y-5">
              {/* Enable/Disable */}
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Enable AI Features</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Unlock AI assistance across all modules</p>
                  </div>
                  <button
                    onClick={() => updateLLMSettings({ enabled: !settings.llm.enabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.llm.enabled ? 'bg-primary-600' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.llm.enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              {/* Model Selection */}
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Model</h3>
                <div className="grid grid-cols-2 gap-2">
                  {LLM_MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => updateLLMSettings({ model: model.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${settings.llm.model === model.id ? 'border-primary-500 bg-primary-500/10' : 'border-white/5 hover:border-white/10 bg-white/3'}`}
                    >
                      <div className="text-xs font-medium text-white">{model.label}</div>
                      <div className="text-[10px] text-slate-500">{model.provider}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-1">API Key</h3>
                <p className="text-xs text-slate-500 mb-3">Stored locally on your device. Never transmitted to external servers.</p>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="sk-... or your API key"
                    value={settings.llm.apiKey}
                    onChange={e => updateLLMSettings({ apiKey: e.target.value })}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Custom Endpoint */}
              {settings.llm.model === 'custom' && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-1">Custom Endpoint</h3>
                  <p className="text-xs text-slate-500 mb-2">For local models (Ollama, LM Studio) or custom API endpoints</p>
                  <input
                    className="input-field"
                    placeholder="http://localhost:11434/v1"
                    value={settings.llm.customEndpoint || ''}
                    onChange={e => updateLLMSettings({ customEndpoint: e.target.value })}
                  />
                </div>
              )}

              {/* Temperature & Tokens */}
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Generation Parameters</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Temperature: {settings.llm.temperature}</label>
                    <input
                      type="range" min="0" max="1" step="0.1"
                      value={settings.llm.temperature}
                      onChange={e => updateLLMSettings({ temperature: parseFloat(e.target.value) })}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Precise</span><span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Max Tokens: {settings.llm.maxTokens}</label>
                    <input
                      type="range" min="200" max="4000" step="100"
                      value={settings.llm.maxTokens}
                      onChange={e => updateLLMSettings({ maxTokens: parseInt(e.target.value) })}
                      className="w-full accent-primary-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>200</span><span>4000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Prompts */}
        {activeSection === 'prompts' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="section-title">Category Prompts</h2>
            <p className="text-sm text-slate-500 mb-6">Customize how AI responds in each module. These prompts are prepended to every AI request in that category, giving you full control over the AI's behavior and focus.</p>

            <div className="space-y-4">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <div key={key} className="card">
                  <label className="text-sm font-semibold text-white mb-1 block">{label}</label>
                  <textarea
                    className="input-field resize-none h-20 text-xs"
                    placeholder={`System prompt for ${label} AI assistance...`}
                    value={settings.llm.categoryPrompts[key as keyof typeof settings.llm.categoryPrompts]}
                    onChange={e => updateLLMSettings({
                      categoryPrompts: { ...settings.llm.categoryPrompts, [key]: e.target.value }
                    })}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Email & RSS */}
        {activeSection === 'email' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="section-title">Email & RSS Configuration</h2>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-5">
              <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                PT Time Block uses a lightweight CLI approach for email — not an MCP server — so it never consumes your AI tokens. Email credentials are stored locally and encrypted on your device.
              </p>
            </div>

            <div className="space-y-5">
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Email Provider</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(['gmail', 'outlook', 'imap'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => updateSettings({ emailConfig: { ...settings.emailConfig, provider: p } as any })}
                      className={`p-2 rounded-lg border text-xs font-medium capitalize transition-all ${settings.emailConfig?.provider === p ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Email / Username</label>
                    <input
                      className="input-field"
                      placeholder="you@gmail.com"
                      value={settings.emailConfig?.username || ''}
                      onChange={e => updateSettings({ emailConfig: { ...settings.emailConfig, username: e.target.value } as any })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">App Password</label>
                    <input
                      type="password"
                      className="input-field"
                      placeholder="App-specific password"
                      value={settings.emailConfig?.password || ''}
                      onChange={e => updateSettings({ emailConfig: { ...settings.emailConfig, password: e.target.value } as any })}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-1">RSS Feeds</h3>
                <p className="text-xs text-slate-500 mb-3">Add newsletter RSS feeds to get curated content without email clutter</p>
                <div className="space-y-2 mb-3">
                  {settings.rssFeeds.map((feed, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className="input-field text-xs flex-1"
                        value={feed}
                        onChange={e => {
                          const feeds = [...settings.rssFeeds]
                          feeds[i] = e.target.value
                          updateSettings({ rssFeeds: feeds })
                        }}
                      />
                      <button
                        onClick={() => updateSettings({ rssFeeds: settings.rssFeeds.filter((_, j) => j !== i) })}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input-field text-xs flex-1"
                    placeholder="https://example.com/feed.rss"
                    value={newFeed}
                    onChange={e => setNewFeed(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newFeed.trim()) {
                        updateSettings({ rssFeeds: [...settings.rssFeeds, newFeed.trim()] })
                        setNewFeed('')
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newFeed.trim()) {
                        updateSettings({ rssFeeds: [...settings.rssFeeds, newFeed.trim()] })
                        setNewFeed('')
                      }
                    }}
                    className="btn-secondary px-3"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Data & Storage */}
        {activeSection === 'data' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="section-title">Data &amp; Storage</h2>
            <p className="text-sm text-slate-500 mb-6">
              {isWeb
                ? 'The web app stores everything in this browser’s local storage on this device. Nothing is sent to a server and no tracking cookies are used.'
                : 'The desktop app stores everything in a local file on this computer. Nothing is sent to a server.'}
            </p>

            <div className="space-y-5">
              {isWeb && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    Because your data lives in the browser, clearing this site&apos;s cookies or
                    site data, uninstalling the browser, or using private browsing will erase it.
                    Export a backup regularly, or use the desktop app if you want your data in a
                    permanent local file.
                  </p>
                </div>
              )}

              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-1">Export Backup</h3>
                <p className="text-xs text-slate-500 mb-3">Download all projects, tasks, time blocks, milestones, boards, health data, and settings as a single JSON file.</p>
                <button onClick={handleExport} className="btn-primary">
                  <Download size={14} />
                  Export data (.json)
                </button>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-1">Import Backup</h3>
                <p className="text-xs text-slate-500 mb-3">Restore from a previously exported file. Imported sections replace what is currently on this device.</p>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImportFile(file)
                    e.target.value = ''
                  }}
                />
                <button onClick={() => importInputRef.current?.click()} className="btn-secondary">
                  <Upload size={14} />
                  Import data
                </button>
              </div>

              <div className="card border-red-500/20">
                <h3 className="text-sm font-semibold text-white mb-1">Clear All Data</h3>
                <p className="text-xs text-slate-500 mb-3">Removes everything stored by the app on this device. This cannot be undone.</p>
                <button
                  onClick={handleClear}
                  className={`btn-secondary ${confirmClear ? '!border-red-500/50 !text-red-400' : ''}`}
                >
                  <Trash2 size={14} />
                  {confirmClear ? 'Tap again to confirm' : 'Clear all data'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* General */}
        {activeSection === 'general' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="section-title">General Settings</h2>
            <div className="space-y-4">
              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Work Schedule</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Work Start</label>
                    <input
                      type="time"
                      className="input-field"
                      value={settings.workingHours.start}
                      onChange={e => updateSettings({ workingHours: { ...settings.workingHours, start: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Work End</label>
                    <input
                      type="time"
                      className="input-field"
                      value={settings.workingHours.end}
                      onChange={e => updateSettings({ workingHours: { ...settings.workingHours, end: e.target.value } })}
                    />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-3">Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">Start of Week</div>
                      <div className="text-xs text-slate-500">Choose your preferred week start</div>
                    </div>
                    <select
                      className="input-field w-32"
                      value={settings.startOfWeek}
                      onChange={e => updateSettings({ startOfWeek: e.target.value as any })}
                    >
                      <option value="monday">Monday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-white">Notifications</div>
                      <div className="text-xs text-slate-500">Enable in-app notifications</div>
                    </div>
                    <button
                      onClick={() => updateSettings({ notifications: !settings.notifications })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-primary-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-sm font-semibold text-white mb-2">About</h3>
                <div className="space-y-1 text-xs text-slate-500">
                  <div className="flex justify-between"><span>App Name</span><span className="text-slate-400">PT Time Block Timeline</span></div>
                  <div className="flex justify-between"><span>Version</span><span className="text-slate-400">1.1.0</span></div>
                  <div className="flex justify-between"><span>Storage</span><span className="text-slate-400">{isWeb ? 'This browser (local storage)' : 'Local file (encrypted)'}</span></div>
                  <div className="flex justify-between"><span>AI Tokens</span><span className="text-slate-400">Direct API (no proxy)</span></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button onClick={handleSave} className="btn-primary">
            {saved ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
