import { useState } from 'react'
import { Plus, CheckSquare, Trash2, Edit, ChevronDown, ChevronRight, Circle, CheckCircle2, Clock, Flag } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { LLMPromptButton } from '../llm/LLMPromptButton'
import type { Task, Priority, Status, Subtask } from '../../types'
import { v4 as uuidv4 } from 'uuid'

const priorityColors: Record<Priority, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-emerald-400',
}

export function TasksView() {
  const { tasks, projects, addTask, updateTask, deleteTask, toggleSubtask, settings } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all')
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const filtered = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    return true
  }).sort((a, b) => {
    const pOrder = { high: 0, medium: 1, low: 2 }
    return pOrder[a.priority] - pOrder[b.priority]
  })

  const getProject = (id?: string) => projects.find(p => p.id === id)

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare size={20} className="text-amber-400" />
            Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{tasks.filter(t => t.status !== 'done').length} pending · {tasks.filter(t => t.status === 'done').length} done</p>
        </div>
        <div className="flex items-center gap-2">
          {settings.llm.enabled && (
            <LLMPromptButton category="tasks" context="Help me break down and prioritize my tasks" />
          )}
          <button onClick={() => { setEditTask(null); setShowModal(true) }} className="btn-primary">
            <Plus size={16} />
            New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-6 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-1">
          {(['all', 'todo', 'in-progress', 'done', 'blocked'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {s === 'all' ? 'All' : s.replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1">
          {(['all', 'high', 'medium', 'low'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterPriority === p ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {p === 'all' ? 'All Priority' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto scrollable p-4 sm:p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <CheckSquare size={48} className="text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No tasks found</h3>
            <p className="text-slate-600 text-sm mb-4">Create your first task to get started</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} /> Create Task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((task, i) => {
                const project = getProject(task.projectId)
                const isExpanded = expandedTask === task.id
                const subtasksDone = task.subtasks.filter(s => s.done).length
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: i * 0.02 }}
                    className="card hover:border-white/10 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      {/* Status toggle */}
                      <button
                        onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {task.status === 'done'
                          ? <CheckCircle2 size={18} className="text-emerald-400" />
                          : <Circle size={18} className="text-slate-600 hover:text-slate-400 transition-colors" />
                        }
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Flag size={12} className={priorityColors[task.priority]} />
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock size={10} />
                                <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                              </div>
                            )}
                            {project && (
                              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: project.color + '20', color: project.color }}>
                                {project.icon} {project.name}
                              </span>
                            )}
                            <button onClick={() => { setEditTask(task); setShowModal(true) }} className="btn-ghost p-1">
                              <Edit size={12} />
                            </button>
                            <button onClick={() => deleteTask(task.id)} className="btn-ghost p-1 hover:text-red-400">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {task.tags.map(tag => (
                              <span key={tag} className="tag bg-white/5 text-slate-400">{tag}</span>
                            ))}
                          </div>
                        )}

                        {/* Subtasks toggle */}
                        {task.subtasks.length > 0 && (
                          <button
                            onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                            className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                            {subtasksDone}/{task.subtasks.length} subtasks
                          </button>
                        )}

                        {/* Subtasks list */}
                        <AnimatePresence>
                          {isExpanded && task.subtasks.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2 space-y-1 pl-2 border-l border-white/10"
                            >
                              {task.subtasks.map(st => (
                                <button
                                  key={st.id}
                                  onClick={() => toggleSubtask(task.id, st.id)}
                                  className="flex items-center gap-2 w-full text-left"
                                >
                                  {st.done
                                    ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                                    : <Circle size={14} className="text-slate-600 flex-shrink-0" />
                                  }
                                  <span className={`text-xs ${st.done ? 'line-through text-slate-600' : 'text-slate-400'}`}>{st.title}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <TaskModal
            task={editTask}
            onClose={() => setShowModal(false)}
            onSave={(data) => {
              if (editTask) updateTask(editTask.id, data)
              else addTask(data)
              setShowModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function TaskModal({ task, onClose, onSave }: {
  task: Task | null
  onClose: () => void
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const { projects } = useAppStore()
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: (task?.status || 'todo') as Status,
    priority: (task?.priority || 'medium') as Priority,
    projectId: task?.projectId || '',
    dueDate: task?.dueDate || '',
    estimatedMinutes: task?.estimatedMinutes || 30,
    tags: task?.tags?.join(', ') || '',
    llmPrompt: task?.llmPrompt || '',
    subtasks: task?.subtasks || [] as Subtask[],
    newSubtask: '',
  })

  const addSubtask = () => {
    if (!form.newSubtask.trim()) return
    setForm(f => ({
      ...f,
      subtasks: [...f.subtasks, { id: uuidv4(), title: f.newSubtask, done: false }],
      newSubtask: '',
    }))
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave({
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      projectId: form.projectId || undefined,
      dueDate: form.dueDate || undefined,
      estimatedMinutes: form.estimatedMinutes,
      actualMinutes: task?.actualMinutes,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      llmPrompt: form.llmPrompt,
      subtasks: form.subtasks,
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
        className="modal-content max-h-[85vh] overflow-y-auto scrollable"
      >
        <h2 className="text-lg font-bold text-white mb-4">{task ? 'Edit Task' : 'New Task'}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Task Title *</label>
            <input className="input-field" placeholder="What needs to be done?" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea className="input-field resize-none h-16" placeholder="Add more details..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Status }))}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Est. Minutes</label>
              <input type="number" className="input-field" value={form.estimatedMinutes} onChange={e => setForm(f => ({ ...f, estimatedMinutes: +e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Project</label>
              <select className="input-field" value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}>
                <option value="">No Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tags</label>
            <input className="input-field" placeholder="design, research, client" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Subtasks</label>
            <div className="space-y-1 mb-2">
              {form.subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/3">
                  <Circle size={12} className="text-slate-600 flex-shrink-0" />
                  <span className="text-xs text-slate-400 flex-1">{st.title}</span>
                  <button onClick={() => setForm(f => ({ ...f, subtasks: f.subtasks.filter(s => s.id !== st.id) }))} className="text-slate-600 hover:text-red-400">
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input-field text-xs"
                placeholder="Add subtask..."
                value={form.newSubtask}
                onChange={e => setForm(f => ({ ...f, newSubtask: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addSubtask()}
              />
              <button onClick={addSubtask} className="btn-secondary px-3 flex-shrink-0">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">AI Prompt (optional)</label>
            <textarea className="input-field resize-none h-14 text-xs" placeholder="Describe what you want AI to help with for this task..." value={form.llmPrompt} onChange={e => setForm(f => ({ ...f, llmPrompt: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            <CheckCircle2 size={14} />
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
