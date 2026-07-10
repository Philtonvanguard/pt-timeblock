import { format } from 'date-fns'
import {
  FolderKanban, CheckSquare, Clock, Heart, Zap, TrendingUp,
  ArrowRight, Calendar, Target, Flame, Droplets, Moon
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { motion } from 'framer-motion'

export function Dashboard() {
  const { projects, tasks, timeBlocks, wellnessRecs, healthGoals, setActiveView, selectedDate } = useAppStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayBlocks = timeBlocks.filter((b) => b.date === today)
  const pendingTasks = tasks.filter((t) => t.status !== 'done')
  const activeProjects = projects.filter((p) => p.status !== 'done')
  const completedToday = tasks.filter((t) => t.status === 'done' && t.updatedAt?.startsWith(today))
  const todayRecs = wellnessRecs.filter((r) => r.date === today)
  const completedRecs = todayRecs.filter((r) => r.completed).length

  const stats = [
    { label: 'Active Projects', value: activeProjects.length, icon: FolderKanban, color: 'text-primary-400', bg: 'bg-primary-500/10', view: 'projects' },
    { label: 'Pending Tasks', value: pendingTasks.length, icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-500/10', view: 'tasks' },
    { label: "Today's Blocks", value: todayBlocks.length, icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10', view: 'timeblock' },
    { label: 'Done Today', value: completedToday.length, icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10', view: 'tasks' },
  ]

  const healthItems = [
    { label: 'Water', icon: Droplets, color: 'text-blue-400', goal: healthGoals.find(g => g.type === 'Water') },
    { label: 'Sleep', icon: Moon, color: 'text-indigo-400', goal: healthGoals.find(g => g.type === 'Sleep') },
    { label: 'Exercise', icon: Flame, color: 'text-orange-400', goal: healthGoals.find(g => g.type === 'Exercise') },
  ]

  return (
    <div className="h-full overflow-y-auto scrollable p-4 sm:p-6 bg-surface-900">
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm text-slate-500 mb-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Good {getGreeting()}, let's focus. 🎯</h1>
        <p className="text-slate-400 text-sm mt-1">Here's your productivity snapshot for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActiveView(stat.view)}
              className="card text-left hover:border-white/10 transition-all duration-200 group"
            >
              <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon size={18} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                <span>View all</span>
                <ArrowRight size={10} />
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Calendar size={16} className="text-primary-400" />
              Today's Schedule
            </h2>
            <button onClick={() => setActiveView('timeblock')} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              Manage <ArrowRight size={10} />
            </button>
          </div>
          {todayBlocks.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No time blocks scheduled for today</p>
              <button onClick={() => setActiveView('timeblock')} className="mt-3 btn-primary text-xs px-3 py-1.5">
                Add Time Block
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayBlocks.slice(0, 6).map((block) => (
                <div key={block.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
                  <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: block.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{block.title}</div>
                    <div className="text-xs text-slate-500">{block.startTime} – {block.endTime}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 capitalize">{block.category}</span>
                </div>
              ))}
              {todayBlocks.length > 6 && (
                <div className="text-xs text-slate-500 text-center pt-1">+{todayBlocks.length - 6} more blocks</div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Health Snapshot */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Heart size={16} className="text-red-400" />
                Health Today
              </h2>
              <button onClick={() => setActiveView('health')} className="text-xs text-primary-400 hover:text-primary-300">
                <ArrowRight size={10} />
              </button>
            </div>
            <div className="space-y-2">
              {healthItems.map((item) => {
                const Icon = item.icon
                const goal = item.goal
                const pct = goal ? Math.min(100, (goal.current / goal.target) * 100) : 0
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon size={12} className={item.color} />
                        <span className="text-xs text-slate-400">{item.label}</span>
                      </div>
                      <span className="text-xs text-slate-500">{goal?.current || 0}/{goal?.target || 0} {goal?.unit}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            {todayRecs.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5">
                <div className="text-xs text-slate-500">{completedRecs}/{todayRecs.length} wellness tasks done</div>
              </div>
            )}
          </div>

          {/* Priority Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Target size={16} className="text-amber-400" />
                Priority Tasks
              </h2>
              <button onClick={() => setActiveView('tasks')} className="text-xs text-primary-400 hover:text-primary-300">
                <ArrowRight size={10} />
              </button>
            </div>
            {pendingTasks.filter(t => t.priority === 'high').length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3">No high-priority tasks 🎉</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.filter(t => t.priority === 'high').slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                    <span className="text-xs text-slate-300 leading-relaxed">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
