import { useState } from 'react'
import { Plus, FolderKanban, MoreHorizontal, Calendar, Tag, Trash2, Edit, CheckCircle } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { LLMPromptButton } from '../llm/LLMPromptButton'
import type { Project, Priority, Status } from '../../types'
import { v4 as uuidv4 } from 'uuid'

const PROJECT_COLORS = ['#6171f6', '#f97316', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']
const PROJECT_ICONS = ['🚀', '💼', '🎯', '📊', '🔧', '🌟', '📱', '🎨', '📝', '🏆']

const statusColors: Record<Status, string> = {
  'todo': 'status-todo',
  'in-progress': 'status-progress',
  'done': 'status-done',
  'blocked': 'bg-red-500/20 text-red-400',
}

const priorityColors: Record<Priority, string> = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
}

export function ProjectsView() {
  const { projects, tasks, addProject, updateProject, deleteProject, settings } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [filter, setFilter] = useState<Status | 'all'>('all')

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  const getProjectTaskStats = (projectId: string) => {
    const ptasks = tasks.filter(t => t.projectId === projectId)
    const done = ptasks.filter(t => t.status === 'done').length
    return { total: ptasks.length, done }
  }

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban size={20} className="text-primary-400" />
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{projects.length} projects total</p>
        </div>
        <div className="flex items-center gap-2">
          {settings.llm.enabled && (
            <LLMPromptButton category="projects" context="Help me plan a new project" />
          )}
          <button onClick={() => { setEditProject(null); setShowModal(true) }} className="btn-primary">
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-1 px-4 sm:px-6 py-3 border-b border-white/5 flex-shrink-0">
        {(['all', 'todo', 'in-progress', 'done', 'blocked'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto scrollable p-4 sm:p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FolderKanban size={48} className="text-slate-700 mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No projects yet</h3>
            <p className="text-slate-600 text-sm mb-4">Create your first project to get started</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus size={16} /> Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((project, i) => {
                const stats = getProjectTaskStats(project.id)
                const pct = stats.total > 0 ? (stats.done / stats.total) * 100 : 0
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="card hover:border-white/10 transition-all duration-200 group cursor-pointer"
                  >
                    {/* Color bar */}
                    <div className="h-1 rounded-full mb-3" style={{ backgroundColor: project.color }} />

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{project.icon}</span>
                        <div>
                          <h3 className="font-semibold text-white text-sm leading-tight">{project.name}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`badge ${statusColors[project.status]}`}>{project.status.replace('-', ' ')}</span>
                            <span className={`badge ${priorityColors[project.priority]}`}>{project.priority}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditProject(project); setShowModal(true) }} className="btn-ghost p-1.5">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => deleteProject(project.id)} className="btn-ghost p-1.5 hover:text-red-400">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                    )}

                    {/* Progress */}
                    {stats.total > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Progress</span>
                          <span className="text-xs text-slate-400">{stats.done}/{stats.total} tasks</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: project.color }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      {project.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={10} />
                          <span>{format(new Date(project.dueDate), 'MMM d')}</span>
                        </div>
                      )}
                      {project.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag size={10} />
                          <span>{project.tags.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ProjectModal
            project={editProject}
            onClose={() => setShowModal(false)}
            onSave={(data) => {
              if (editProject) updateProject(editProject.id, data)
              else addProject(data)
              setShowModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ProjectModal({ project, onClose, onSave }: {
  project: Project | null
  onClose: () => void
  onSave: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
}) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || PROJECT_COLORS[0],
    icon: project?.icon || PROJECT_ICONS[0],
    status: (project?.status || 'todo') as Status,
    priority: (project?.priority || 'medium') as Priority,
    startDate: project?.startDate || format(new Date(), 'yyyy-MM-dd'),
    dueDate: project?.dueDate || '',
    tags: project?.tags?.join(', ') || '',
    llmPrompt: project?.llmPrompt || '',
  })

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      name: form.name,
      description: form.description,
      color: form.color,
      icon: form.icon,
      status: form.status,
      priority: form.priority,
      startDate: form.startDate,
      dueDate: form.dueDate,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
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
        className="modal-content max-w-lg w-full"
      >
        <h2 className="text-lg font-bold text-white mb-4">{project ? 'Edit Project' : 'New Project'}</h2>

        <div className="space-y-3">
          {/* Icon & Color */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {PROJECT_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${form.icon === icon ? 'bg-primary-600' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Color</label>
              <div className="flex flex-wrap gap-1.5">
                {PROJECT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setForm(f => ({ ...f, color }))}
                    className={`w-6 h-6 rounded-full transition-all ${form.color === color ? 'ring-2 ring-white ring-offset-1 ring-offset-surface-700' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Project Name *</label>
            <input className="input-field" placeholder="e.g. Website Redesign" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea className="input-field resize-none h-16" placeholder="What is this project about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
              <input type="date" className="input-field" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Due Date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Tags (comma separated)</label>
            <input className="input-field" placeholder="marketing, q1, client" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">AI Prompt (optional)</label>
            <textarea className="input-field resize-none h-14 text-xs" placeholder="Describe what you want AI to help with for this project..." value={form.llmPrompt} onChange={e => setForm(f => ({ ...f, llmPrompt: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">
            <CheckCircle size={14} />
            {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
