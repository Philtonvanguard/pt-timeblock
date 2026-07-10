import { useState } from 'react'
import { Sparkles, X, Send, Copy, Check, Loader2 } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { generateGenericResponse } from './llmService'
import { motion, AnimatePresence } from 'framer-motion'

interface LLMPromptButtonProps {
  category: string
  context: string
  onResult?: (result: string) => void
  compact?: boolean
}

export function LLMPromptButton({ category, context, onResult, compact = false }: LLMPromptButtonProps) {
  const { settings, addNotification } = useAppStore()
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState(settings.llm.categoryPrompts[category as keyof typeof settings.llm.categoryPrompts] || '')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!settings.llm.enabled) return null

  const handleGenerate = async () => {
    if (!settings.llm.apiKey) {
      addNotification({ type: 'warning', title: 'API Key Missing', message: 'Add your API key in Settings > AI Configuration.' })
      return
    }
    setIsLoading(true)
    setResult('')
    try {
      const response = await generateGenericResponse(settings.llm, category, context, prompt)
      setResult(response)
      onResult?.(response)
    } catch (e: any) {
      addNotification({ type: 'error', title: 'AI Error', message: e.message || 'Failed to generate response.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`llm-badge cursor-pointer hover:bg-violet-500/30 transition-colors ${compact ? 'px-2 py-0.5' : ''}`}
      >
        <Sparkles size={12} />
        {!compact && 'Ask AI'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="modal-content max-w-xl w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Sparkles size={14} className="text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">AI Assistant</h2>
                    <p className="text-xs text-slate-500 capitalize">{category} · {settings.llm.model}</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="btn-ghost p-1.5">
                  <X size={14} />
                </button>
              </div>

              <div className="mb-3">
                <label className="text-xs text-slate-400 mb-1 block">Your Prompt</label>
                <textarea
                  className="input-field resize-none h-24"
                  placeholder="Describe what you want AI to help you with..."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              </div>

              <div className="mb-3 p-2 rounded-lg bg-white/3 border border-white/5">
                <p className="text-xs text-slate-500"><span className="text-slate-400 font-medium">Context:</span> {context}</p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="btn-primary w-full justify-center mb-4 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isLoading ? 'Generating...' : 'Generate'}
              </button>

              {result && (
                <div className="relative">
                  <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20 max-h-64 overflow-y-auto scrollable">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 btn-ghost p-1.5 text-xs"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
