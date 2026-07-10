import { useState, useEffect } from 'react'
import { Heart, Droplets, Moon, Flame, Footprints, Brain, Apple, Sun, Sunset, Star, CheckCircle2, Circle, Plus, TrendingUp, RefreshCw } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { generateWellnessRecommendations } from '../llm/llmService'
import type { WellnessRecommendation, HealthMetric } from '../../types'
import { v4 as uuidv4 } from 'uuid'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'

const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  morning: Sun,
  nutrition: Apple,
  movement: Flame,
  mindset: Brain,
  evening: Sunset,
  productivity: Star,
}

const CATEGORY_COLORS: Record<string, string> = {
  morning: '#f59e0b',
  nutrition: '#10b981',
  movement: '#f97316',
  mindset: '#8b5cf6',
  evening: '#6171f6',
  productivity: '#06b6d4',
}

const DEFAULT_RECS: Omit<WellnessRecommendation, 'id' | 'date' | 'completed'>[] = [
  { category: 'morning', title: 'Morning Hydration', description: 'Drink 2 glasses of water immediately upon waking to kickstart your metabolism and rehydrate after sleep.', duration: '2 min', priority: 'high' },
  { category: 'morning', title: '10-Minute Sunlight Exposure', description: 'Step outside or sit by a window for natural light to regulate your circadian rhythm and boost serotonin.', duration: '10 min', priority: 'high' },
  { category: 'nutrition', title: 'Protein-Rich Breakfast', description: 'Aim for 30g of protein within 1 hour of waking to stabilize blood sugar and improve focus throughout the day.', duration: '15 min', priority: 'high' },
  { category: 'movement', title: 'Movement Break', description: 'Every 90 minutes, take a 5-minute walk or stretch to improve circulation, reduce fatigue, and maintain cognitive performance.', duration: '5 min', priority: 'medium' },
  { category: 'mindset', title: 'Gratitude Journaling', description: 'Write 3 things you are grateful for. This practice rewires your brain toward positivity and has been shown to improve sleep quality.', duration: '5 min', priority: 'medium' },
  { category: 'mindset', title: 'Focused Breathing', description: 'Practice box breathing (4-4-4-4) for 5 minutes to activate the parasympathetic nervous system and reduce cortisol.', duration: '5 min', priority: 'medium' },
  { category: 'movement', title: 'Strength or Cardio Session', description: 'Complete at least 30 minutes of intentional exercise. Prioritize compound movements for maximum hormonal benefit.', duration: '30 min', priority: 'high' },
  { category: 'nutrition', title: 'Hydration Goal', description: 'Drink at least 8 glasses of water today. Add electrolytes if exercising. Proper hydration improves focus by up to 20%.', duration: 'All day', priority: 'high' },
  { category: 'productivity', title: 'Single-Tasking Block', description: 'Identify your #1 priority task and work on it for 90 minutes with zero distractions. This is your most valuable productivity habit.', duration: '90 min', priority: 'high' },
  { category: 'evening', title: 'Digital Sunset', description: 'Avoid screens 1 hour before bed. Blue light suppresses melatonin by up to 50%, significantly impacting sleep quality.', duration: '60 min', priority: 'medium' },
  { category: 'evening', title: 'Wind-Down Routine', description: 'Spend 15 minutes on a calming activity: reading, light stretching, or meditation. Consistent routines signal your brain that sleep is approaching.', duration: '15 min', priority: 'medium' },
  { category: 'nutrition', title: 'Mindful Eating', description: 'Eat without screens or distractions. Chew slowly and stop at 80% full. This improves digestion and reduces overeating by up to 30%.', duration: '20 min', priority: 'low' },
]

export function HealthProView() {
  const { healthGoals, healthMetrics, wellnessRecs, updateHealthGoal, addHealthMetric, setWellnessRecs, toggleWellnessRec, settings, addNotification } = useAppStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'today' | 'goals' | 'metrics'>('today')
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayRecs = wellnessRecs.filter(r => r.date === today)

  useEffect(() => {
    if (todayRecs.length === 0) {
      loadDefaultRecs()
    }
  }, [])

  const loadDefaultRecs = () => {
    const recs: WellnessRecommendation[] = DEFAULT_RECS.map(r => ({
      ...r,
      id: uuidv4(),
      date: today,
      completed: false,
    }))
    setWellnessRecs(recs)
  }

  const handleGenerateWithAI = async () => {
    if (!settings.llm.enabled || !settings.llm.apiKey) {
      addNotification({ type: 'warning', title: 'AI Not Configured', message: 'Enable AI in Settings to generate personalized recommendations.' })
      return
    }
    setIsGenerating(true)
    try {
      const recs = await generateWellnessRecommendations(settings.llm, today)
      setWellnessRecs(recs)
      addNotification({ type: 'success', title: 'Recommendations Generated', message: 'Your personalized wellness plan is ready!' })
    } catch (e) {
      addNotification({ type: 'error', title: 'Generation Failed', message: 'Could not generate recommendations. Check your AI settings.' })
      loadDefaultRecs()
    } finally {
      setIsGenerating(false)
    }
  }

  const completedCount = todayRecs.filter(r => r.completed).length
  const completionPct = todayRecs.length > 0 ? Math.round((completedCount / todayRecs.length) * 100) : 0

  const groupedRecs = todayRecs.reduce((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = []
    acc[rec.category].push(rec)
    return acc
  }, {} as Record<string, WellnessRecommendation[]>)

  return (
    <div className="h-full flex flex-col bg-surface-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-white/5 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Heart size={20} className="text-red-400" />
            Health Pro
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Your daily wellness command center</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className={`btn-primary ${isGenerating ? 'opacity-70' : ''}`}
          >
            <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Generating...' : 'AI Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 px-4 sm:px-6 py-3 border-b border-white/5 flex-shrink-0">
        {(['today', 'goals', 'metrics'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${activeTab === tab ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            {tab === 'today' ? "Today's Plan" : tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollable p-6">
        {activeTab === 'today' && (
          <div>
            {/* Progress Ring */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="url(#healthGrad)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${completionPct * 2.51} 251`}
                    className="transition-all duration-700"
                  />
                  <defs>
                    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6171f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-white">{completionPct}%</span>
                  <span className="text-[10px] text-slate-500">done</span>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white mb-1">
                  {completionPct === 100 ? '🎉 Perfect Day!' : completionPct >= 70 ? '💪 Great Progress!' : completionPct >= 40 ? '🔥 Keep Going!' : "Let's get started!"}
                </h2>
                <p className="text-sm text-slate-400">{completedCount} of {todayRecs.length} wellness tasks completed</p>
                <p className="text-xs text-slate-600 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
              </div>
            </div>

            {/* Recommendations by category */}
            {Object.entries(groupedRecs).map(([category, recs]) => {
              const Icon = CATEGORY_ICONS[category] || Heart
              const color = CATEGORY_COLORS[category] || '#6171f6'
              const catDone = recs.filter(r => r.completed).length
              return (
                <div key={category} className="mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} style={{ color }} />
                    <h3 className="text-sm font-semibold text-white capitalize">{category}</h3>
                    <span className="text-xs text-slate-600">{catDone}/{recs.length}</span>
                  </div>
                  <div className="space-y-2">
                    {recs.map((rec) => (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`health-card transition-all duration-200 ${rec.completed ? 'opacity-60' : ''}`}
                        style={{ borderLeftColor: color }}
                      >
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleWellnessRec(rec.id)} className="mt-0.5 flex-shrink-0">
                            {rec.completed
                              ? <CheckCircle2 size={18} className="text-emerald-400" />
                              : <Circle size={18} className="text-slate-600 hover:text-slate-400 transition-colors" />
                            }
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`text-sm font-medium ${rec.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                                {rec.title}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                {rec.duration && (
                                  <span className="text-xs text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{rec.duration}</span>
                                )}
                                <span className={`badge ${rec.priority === 'high' ? 'priority-high' : rec.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}>
                                  {rec.priority}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{rec.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'goals' && (
          <div>
            <h2 className="section-title">Daily Health Goals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {healthGoals.map((goal) => {
                const pct = Math.min(100, (goal.current / goal.target) * 100)
                const icons: Record<string, React.ComponentType<any>> = {
                  Water: Droplets, Steps: Footprints, Sleep: Moon, Exercise: Flame, Meditation: Brain
                }
                const colors: Record<string, string> = {
                  Water: '#06b6d4', Steps: '#10b981', Sleep: '#8b5cf6', Exercise: '#f97316', Meditation: '#6171f6'
                }
                const Icon = icons[goal.type] || Heart
                const color = colors[goal.type] || '#6171f6'
                return (
                  <div key={goal.id} className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{goal.type}</div>
                          <div className="text-xs text-slate-500">{goal.frequency}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">{goal.current}</div>
                        <div className="text-xs text-slate-500">/ {goal.target} {goal.unit}</div>
                      </div>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{Math.round(pct)}% complete</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateHealthGoal(goal.id, { current: Math.max(0, goal.current - 1) })}
                          className="w-6 h-6 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
                        >−</button>
                        <button
                          onClick={() => updateHealthGoal(goal.id, { current: goal.current + 1 })}
                          className="w-6 h-6 rounded text-white text-xs font-bold transition-colors"
                          style={{ backgroundColor: color + '40' }}
                        >+</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title mb-0">Health Metrics</h2>
              <button
                onClick={() => {
                  const type = prompt('Metric type (sleep/water/exercise/mood/steps/weight/meditation):') as HealthMetric['type']
                  const value = parseFloat(prompt('Value:') || '0')
                  const unit = prompt('Unit:') || ''
                  if (type && value) {
                    addHealthMetric({ date: today, type, value, unit })
                  }
                }}
                className="btn-secondary text-xs"
              >
                <Plus size={14} /> Log Metric
              </button>
            </div>
            {healthMetrics.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp size={32} className="text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No metrics logged yet. Start tracking your health data!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {healthMetrics.slice().reverse().map((metric) => (
                  <div key={metric.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-700 border border-white/5">
                    <div className="text-sm font-medium text-white capitalize w-24">{metric.type}</div>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <div className="text-sm font-bold text-white">{metric.value} <span className="text-xs text-slate-500">{metric.unit}</span></div>
                    <div className="text-xs text-slate-600">{format(new Date(metric.date), 'MMM d')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
