import { useState } from 'react'
import { Plus, GitBranch, CheckCircle2, Circle, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO, isWithinInterval, isSameDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { LLMPromptButton } from '../llm/LLMPromptButton'
import type { Milestone } from '../../types'

const MILESTONE_COLORS = ['#6171f6', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function TimelineView() {
  const { projects, milestones, addMilestone, updateMilestone, deleteMilestone, settings } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedProject, setSelectedProject] = useState<string>('all')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const filteredMilestones = milestones.filter(m =>
    (selectedProject === 'all' || m.projectId === selectedProject)
  )

  const getMilestonesForDay = (date: Date) =>
    filteredMilestones.filter(m => isSameDay(parseISO(m.date), date))

  const getProject = (id: string) => projects.find(p => p.id === id)

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch size={20} className="text-violet-400" />
            Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{milestones.length} milestones across {projects.length} projects</p>
        </div>
        <div className="flex items-center gap-2">
          {settings.llm.enabled && (
            <LLMPromptButton category="timeline" context="Help me create a realistic project timeline" />
          )}
          <button onClick={() => { setEditMilestone(null); setShowModal(true) }} className="btn-primary">
            <Plus size={16} />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="btn-ghost p-2">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-white min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="btn-ghost p-2">
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="text-xs text-primary-400 hover:text-primary-300 px-2 py-1 rounded-lg hover:bg-primary-500/10 transition-colors">
            Today
          </button>
        </div>
        <select
          className="input-field w-full sm:w-48 text-xs"
          value={selectedProject}
          onChange={e => setSelectedProject(e.target.value)}
        >
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto scrollable p-4 sm:p-6">
        {/* Calendar Grid */}
        <div className="card mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Offset for first day */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20" />
            ))}
            {days.map(day => {
              const dayMilestones = getMilestonesForDay(day)
              const isToday = isSameDay(day, new Date())
              return (
                <div
                  key={day.toISOString()}
                  className={`h-20 rounded-lg p-1.5 border transition-colors cursor-pointer hover:border-white/10 ${isToday ? 'border-primary-500/40 bg-primary-500/5' : 'border-transparent'}`}
                  onClick={() => {
                    setEditMilestone(null)
                    setShowModal(true)
                  }}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary-400' : 'text-slate-500'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayMilestones.slice(0, 3).map(m => {
                      const project = getProject(m.projectId)
                      return (
                        <div
                          key={m.id}
                          className="text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1 cursor-pointer"
                          style={{ backgroundColor: m.color + '30', color: m.color }}
                          onClick={(e) => { e.stopPropagation(); setEditMilestone(m); setShowModal(true) }}
                        >
                          {m.completed ? '✓' : '◆'} {m.title}
                        </div>
                      )
                    })}
                    {dayMilestones.length > 3 && (
                      <div className="text-[10px] text-slate-600">+{dayMilestones.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Milestone List */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-3">All Milestones</h3>
          {filteredMilestones.length === 0 ? (
            <div className="text-center py-8">
              <GitBranch size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No milestones yet. Add your first milestone!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMilestones.sort((a, b) => a.date.localeCompare(b.date)).map((m, i) => {
                const project = getProject(m.projectId)
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 rounded-xl bg-surface-700 border border-white/5 hover:border-white/10 transition-all group"
                  >
                    <button onClick={() => updateMilestone(m.id, { completed: !m.completed })}>
                      {m.completed
                        ? <CheckCircle2 size={18} className="text-emerald-400" />
                        : <Circle size={18} className="text-slate-600 hover:text-slate-400 transition-colors" />
                      }
                    </button>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${m.completed ? 'line-through text-slate-500' : 'text-white'}`}>{m.title}</div>
                      {m.description && <div className="text-xs text-slate-500 truncate">{m.description}</div>}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {project && (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: project.color + '20', color: project.color }}>
                          {project.icon} {project.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar size={10} />
                        <span>{format(parseISO(m.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditMilestone(m); setShowModal(true) }} className="btn-ghost p-1">
                          <Calendar size={12} />
                        </button>
                        <button onClick={() => deleteMilestone(m.id)} className="btn-ghost p-1 hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <MilestoneModal
            milestone={editMilestone}
            onClose={() => setShowModal(false)}
            onSave={(data) => {
              if (editMilestone) updateMilestone(editMilestone.id, data)
              else addMilestone(data)
              setShowModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function MilestoneModal({ milestone, onClose, onSave }: {
  milestone: Milestone | null
  onClose: () => void
  onSave: (data: Omit<Milestone, 'id'>) => void
}) {
  const { projects } = useAppStore()
  const [form, setForm] = useState({
    title: milestone?.title || '',
    projectId: milestone?.projectId || (projects[0]?.id || ''),
    date: milestone?.date || format(new Date(), 'yyyy-MM-dd'),
    color: milestone?.color || MILESTONE_COLORS[0],
    completed: milestone?.completed || false,
    description: milestone?.description || '',
  })

  const handleSave = () => {
    if (!form.title.trim() || !form.projectId) return
    onSave(form)
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
        <h2 className="text-lg font-bold text-white mb-4">{milestone ? 'Edit Milestone' : 'New Milestone'}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Milestone Title *</label>
            <input className="input-field" placeholder="e.g. MVP Launch" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Project *</label>
              <select className="input-field" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">Select project...</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date *</label>
              <input type="date" className="input-field" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Color</label>
            <div className="flex gap-2">
              {MILESTONE_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-6 h-6 rounded-full transition-all ${form.color === color ? 'ring-2 ring-white ring-offset-1 ring-offset-surface-700' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea className="input-field resize-none h-14" placeholder="Optional description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.completed} onChange={e => setForm(f => ({ ...f, completed: e.target.checked }))} className="rounded" />
            <span className="text-sm text-slate-400">Mark as completed</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            <CheckCircle2 size={14} />
            {milestone ? 'Save Changes' : 'Add Milestone'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
