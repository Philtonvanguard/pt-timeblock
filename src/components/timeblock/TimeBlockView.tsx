import { useState } from 'react'
import { Plus, Clock, ChevronLeft, ChevronRight, Trash2, Edit, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { format, addDays, subDays, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { LLMPromptButton } from '../llm/LLMPromptButton'
import type { TimeBlock } from '../../types'

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const CATEGORIES = ['work', 'health', 'personal', 'learning', 'admin', 'deep-work', 'meeting', 'break'] as const
const CATEGORY_COLORS: Record<string, string> = {
  'work': '#6171f6',
  'health': '#10b981',
  'personal': '#f97316',
  'learning': '#8b5cf6',
  'admin': '#64748b',
  'deep-work': '#ef4444',
  'meeting': '#06b6d4',
  'break': '#f59e0b',
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function TimeBlockView() {
  const { timeBlocks, addTimeBlock, updateTimeBlock, deleteTimeBlock, selectedDate, setSelectedDate, settings } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editBlock, setEditBlock] = useState<TimeBlock | null>(null)
  const [clickedHour, setClickedHour] = useState<number | null>(null)

  const dayBlocks = timeBlocks.filter(b => b.date === selectedDate)

  const handlePrevDay = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  const handleNextDay = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))

  const handleGridClick = (hour: number) => {
    setClickedHour(hour)
    setEditBlock(null)
    setShowModal(true)
  }

  const getBlockStyle = (block: TimeBlock) => {
    const startMin = timeToMinutes(block.startTime)
    const endMin = timeToMinutes(block.endTime)
    const top = (startMin / 60) * 64
    const height = Math.max(((endMin - startMin) / 60) * 64, 24)
    return { top, height }
  }

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-emerald-400" />
            Time Blocks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{dayBlocks.length} blocks scheduled</p>
        </div>
        <div className="flex items-center gap-2">
          {settings.llm.enabled && (
            <LLMPromptButton category="timeblock" context="Suggest an optimal time blocking schedule for today" />
          )}
          <button onClick={() => { setEditBlock(null); setClickedHour(9); setShowModal(true) }} className="btn-primary">
            <Plus size={16} />
            Add Block
          </button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="flex items-center justify-center gap-4 px-6 py-3 border-b border-white/5 flex-shrink-0">
        <button onClick={handlePrevDay} className="btn-ghost p-2">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-white">{format(parseISO(selectedDate), 'EEEE')}</div>
          <div className="text-xs text-slate-500">{format(parseISO(selectedDate), 'MMMM d, yyyy')}</div>
        </div>
        <button onClick={handleNextDay} className="btn-ghost p-2">
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
          className="text-xs text-primary-400 hover:text-primary-300 px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Category Legend */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-2 border-b border-white/5 flex-shrink-0 flex-wrap">
        {CATEGORIES.map(cat => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
            <span className="text-xs text-slate-500 capitalize">{cat.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto scrollable">
        <div className="flex">
          {/* Hour labels */}
          <div className="w-16 flex-shrink-0">
            {HOURS.map(hour => (
              <div key={hour} className="h-16 flex items-start justify-end pr-3 pt-1">
                <span className="text-xs text-slate-600">{hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}</span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 relative border-l border-white/5">
            {/* Hour lines */}
            {HOURS.map(hour => (
              <div
                key={hour}
                className="h-16 border-b border-white/5 cursor-pointer hover:bg-white/2 transition-colors group"
                onClick={() => handleGridClick(hour)}
              >
                <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-slate-600">+ Add block</span>
                </div>
              </div>
            ))}

            {/* Time blocks */}
            {dayBlocks.map(block => {
              const { top, height } = getBlockStyle(block)
              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-1 right-2 rounded-lg px-2 py-1 cursor-pointer group overflow-hidden"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: block.color + 'cc',
                    borderLeft: `3px solid ${block.color}`,
                  }}
                  onClick={(e) => { e.stopPropagation(); setEditBlock(block); setShowModal(true) }}
                >
                  <div className="flex items-start justify-between h-full">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{block.title}</div>
                      {height > 32 && (
                        <div className="text-[10px] text-white/70">{block.startTime} – {block.endTime}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTimeBlock(block.id) }}
                        className="text-white/70 hover:text-white"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <TimeBlockModal
            block={editBlock}
            defaultHour={clickedHour || 9}
            date={selectedDate}
            onClose={() => setShowModal(false)}
            onSave={(data) => {
              if (editBlock) updateTimeBlock(editBlock.id, data)
              else addTimeBlock(data)
              setShowModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TimeBlockModal({ block, defaultHour, date, onClose, onSave }: {
  block: TimeBlock | null
  defaultHour: number
  date: string
  onClose: () => void
  onSave: (data: Omit<TimeBlock, 'id' | 'createdAt'>) => void
}) {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const [form, setForm] = useState({
    title: block?.title || '',
    date: block?.date || date,
    startTime: block?.startTime || `${pad(defaultHour)}:00`,
    endTime: block?.endTime || `${pad(defaultHour + 1)}:00`,
    color: block?.color || CATEGORY_COLORS['work'],
    category: block?.category || 'work' as TimeBlock['category'],
    notes: block?.notes || '',
    recurring: block?.recurring || 'none' as TimeBlock['recurring'],
    llmPrompt: block?.llmPrompt || '',
  })

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      title: form.title,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      color: CATEGORY_COLORS[form.category] || form.color,
      category: form.category,
      notes: form.notes,
      recurring: form.recurring,
      llmPrompt: form.llmPrompt,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="modal-content"
      >
        <h2 className="text-lg font-bold text-white mb-4">{block ? 'Edit Time Block' : 'New Time Block'}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Title *</label>
            <input className="input-field" placeholder="e.g. Deep Work Session" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as TimeBlock['category'] }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date</label>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
              <input type="time" className="input-field" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">End Time</label>
              <input type="time" className="input-field" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Recurring</label>
            <select className="input-field" value={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.value as TimeBlock['recurring'] }))}>
              <option value="none">No Repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <textarea className="input-field resize-none h-14" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">AI Prompt (optional)</label>
            <textarea className="input-field resize-none h-12 text-xs" placeholder="Ask AI to help optimize this time block..." value={form.llmPrompt} onChange={e => setForm(f => ({ ...f, llmPrompt: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            <CheckCircle2 size={14} />
            {block ? 'Save Changes' : 'Add Block'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
