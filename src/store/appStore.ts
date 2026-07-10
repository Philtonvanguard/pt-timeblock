import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import type {
  AppState, Project, Task, TimeBlock, Milestone, VisionBoard, VisionItem,
  HealthMetric, HealthGoal, WellnessRecommendation, EmailSummary, Newsletter,
  ViralPost, AppSettings, AppNotification, LLMSettings
} from '../types'

const defaultLLM: LLMSettings = {
  enabled: false,
  model: 'gpt-4o-mini',
  apiKey: '',
  temperature: 0.7,
  maxTokens: 1000,
  categoryPrompts: {
    projects: 'Help me break down and plan this project with clear milestones and deliverables.',
    tasks: 'Help me clarify and prioritize this task with actionable steps.',
    timeblock: 'Suggest an optimal time blocking schedule for maximum focus and productivity.',
    timeline: 'Help me create a realistic project timeline with buffer time and dependencies.',
    health: 'Provide personalized daily wellness recommendations based on my goals.',
    emails: 'Summarize and categorize my emails, highlighting what requires immediate action.',
    newsletters: 'Extract the key insights and actionable takeaways from this newsletter.',
    viralPosts: 'Generate engaging, platform-optimized content that drives high engagement.',
    visionboard: 'Help me articulate and visualize my goals with clarity and intention.',
  }
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#6171f6',
  startOfWeek: 'monday',
  workingHours: { start: '09:00', end: '18:00' },
  notifications: true,
  autoSync: false,
  syncInterval: 30,
  rssFeeds: [
    'https://feeds.feedburner.com/entrepreneur/latest',
    'https://www.producthunt.com/feed',
    'https://hbr.org/feed',
  ],
  llm: defaultLLM,
}

interface AppStore extends AppState {
  // Projects
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void

  // Time Blocks
  addTimeBlock: (tb: Omit<TimeBlock, 'id' | 'createdAt'>) => void
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void
  deleteTimeBlock: (id: string) => void

  // Milestones
  addMilestone: (m: Omit<Milestone, 'id'>) => void
  updateMilestone: (id: string, updates: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void

  // Vision Board
  addVisionBoard: (name: string) => void
  updateVisionBoard: (id: string, updates: Partial<VisionBoard>) => void
  deleteVisionBoard: (id: string) => void
  addVisionItem: (boardId: string, item: Omit<VisionItem, 'id' | 'createdAt'>) => void
  updateVisionItem: (boardId: string, itemId: string, updates: Partial<VisionItem>) => void
  deleteVisionItem: (boardId: string, itemId: string) => void

  // Health
  addHealthMetric: (m: Omit<HealthMetric, 'id'>) => void
  updateHealthGoal: (id: string, updates: Partial<HealthGoal>) => void
  setWellnessRecs: (recs: WellnessRecommendation[]) => void
  toggleWellnessRec: (id: string) => void

  // Automation
  setEmails: (emails: EmailSummary[]) => void
  setNewsletters: (newsletters: Newsletter[]) => void
  addViralPost: (post: Omit<ViralPost, 'id' | 'generatedAt'>) => void
  toggleSaveNewsletter: (id: string) => void
  toggleSaveViralPost: (id: string) => void

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void
  updateLLMSettings: (updates: Partial<LLMSettings>) => void

  // UI
  setActiveView: (view: string) => void
  setSelectedProject: (id: string | null) => void
  setSelectedDate: (date: string) => void
  toggleSidebar: () => void
  setLoading: (loading: boolean) => void
  addNotification: (n: Omit<AppNotification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void

  // Persistence
  loadFromStorage: () => Promise<void>
  saveToStorage: () => Promise<void>
  exportData: () => string
  importData: (json: string) => boolean
  clearAllData: () => void
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  projects: [],
  tasks: [],
  timeBlocks: [],
  milestones: [],
  visionBoards: [],
  healthMetrics: [],
  healthGoals: [
    { id: uuidv4(), type: 'Water', target: 8, unit: 'glasses', frequency: 'daily', current: 0 },
    { id: uuidv4(), type: 'Steps', target: 10000, unit: 'steps', frequency: 'daily', current: 0 },
    { id: uuidv4(), type: 'Sleep', target: 8, unit: 'hours', frequency: 'daily', current: 0 },
    { id: uuidv4(), type: 'Exercise', target: 30, unit: 'minutes', frequency: 'daily', current: 0 },
    { id: uuidv4(), type: 'Meditation', target: 10, unit: 'minutes', frequency: 'daily', current: 0 },
  ],
  wellnessRecs: [],
  emails: [],
  newsletters: [],
  viralPosts: [],
  settings: defaultSettings,
  activeView: 'dashboard',
  selectedProjectId: null,
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  sidebarCollapsed: false,
  isLoading: false,
  notifications: [],

  // Projects
  addProject: (p) => {
    const now = new Date().toISOString()
    const project: Project = { ...p, id: uuidv4(), createdAt: now, updatedAt: now }
    set((s) => ({ projects: [...s.projects, project] }))
    get().saveToStorage()
  },
  updateProject: (id, updates) => {
    set((s) => ({
      projects: s.projects.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    }))
    get().saveToStorage()
  },
  deleteProject: (id) => {
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
    get().saveToStorage()
  },

  // Tasks
  addTask: (t) => {
    const now = new Date().toISOString()
    const task: Task = { ...t, id: uuidv4(), createdAt: now, updatedAt: now }
    set((s) => ({ tasks: [...s.tasks, task] }))
    get().saveToStorage()
  },
  updateTask: (id, updates) => {
    set((s) => ({
      tasks: s.tasks.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
    }))
    get().saveToStorage()
  },
  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    get().saveToStorage()
  },
  toggleSubtask: (taskId, subtaskId) => {
    set((s) => ({
      tasks: s.tasks.map((t) => t.id === taskId ? {
        ...t,
        subtasks: t.subtasks.map((st) => st.id === subtaskId ? { ...st, done: !st.done } : st)
      } : t)
    }))
    get().saveToStorage()
  },

  // Time Blocks
  addTimeBlock: (tb) => {
    const block: TimeBlock = { ...tb, id: uuidv4(), createdAt: new Date().toISOString() }
    set((s) => ({ timeBlocks: [...s.timeBlocks, block] }))
    get().saveToStorage()
  },
  updateTimeBlock: (id, updates) => {
    set((s) => ({ timeBlocks: s.timeBlocks.map((b) => b.id === id ? { ...b, ...updates } : b) }))
    get().saveToStorage()
  },
  deleteTimeBlock: (id) => {
    set((s) => ({ timeBlocks: s.timeBlocks.filter((b) => b.id !== id) }))
    get().saveToStorage()
  },

  // Milestones
  addMilestone: (m) => {
    const milestone: Milestone = { ...m, id: uuidv4() }
    set((s) => ({ milestones: [...s.milestones, milestone] }))
    get().saveToStorage()
  },
  updateMilestone: (id, updates) => {
    set((s) => ({ milestones: s.milestones.map((m) => m.id === id ? { ...m, ...updates } : m) }))
    get().saveToStorage()
  },
  deleteMilestone: (id) => {
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) }))
    get().saveToStorage()
  },

  // Vision Board
  addVisionBoard: (name) => {
    const board: VisionBoard = {
      id: uuidv4(), name, items: [], background: 'gradient-1',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }
    set((s) => ({ visionBoards: [...s.visionBoards, board] }))
    get().saveToStorage()
  },
  updateVisionBoard: (id, updates) => {
    set((s) => ({
      visionBoards: s.visionBoards.map((b) => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)
    }))
    get().saveToStorage()
  },
  deleteVisionBoard: (id) => {
    set((s) => ({ visionBoards: s.visionBoards.filter((b) => b.id !== id) }))
    get().saveToStorage()
  },
  addVisionItem: (boardId, item) => {
    const newItem: VisionItem = { ...item, id: uuidv4(), createdAt: new Date().toISOString() }
    set((s) => ({
      visionBoards: s.visionBoards.map((b) => b.id === boardId ? { ...b, items: [...b.items, newItem] } : b)
    }))
    get().saveToStorage()
  },
  updateVisionItem: (boardId, itemId, updates) => {
    set((s) => ({
      visionBoards: s.visionBoards.map((b) => b.id === boardId ? {
        ...b, items: b.items.map((i) => i.id === itemId ? { ...i, ...updates } : i)
      } : b)
    }))
    get().saveToStorage()
  },
  deleteVisionItem: (boardId, itemId) => {
    set((s) => ({
      visionBoards: s.visionBoards.map((b) => b.id === boardId ? {
        ...b, items: b.items.filter((i) => i.id !== itemId)
      } : b)
    }))
    get().saveToStorage()
  },

  // Health
  addHealthMetric: (m) => {
    const metric: HealthMetric = { ...m, id: uuidv4() }
    set((s) => ({ healthMetrics: [...s.healthMetrics, metric] }))
    get().saveToStorage()
  },
  updateHealthGoal: (id, updates) => {
    set((s) => ({ healthGoals: s.healthGoals.map((g) => g.id === id ? { ...g, ...updates } : g) }))
    get().saveToStorage()
  },
  setWellnessRecs: (recs) => set({ wellnessRecs: recs }),
  toggleWellnessRec: (id) => {
    set((s) => ({
      wellnessRecs: s.wellnessRecs.map((r) => r.id === id ? { ...r, completed: !r.completed } : r)
    }))
  },

  // Automation
  setEmails: (emails) => set({ emails }),
  setNewsletters: (newsletters) => set({ newsletters }),
  addViralPost: (post) => {
    const newPost: ViralPost = { ...post, id: uuidv4(), generatedAt: new Date().toISOString() }
    set((s) => ({ viralPosts: [newPost, ...s.viralPosts] }))
    get().saveToStorage()
  },
  toggleSaveNewsletter: (id) => {
    set((s) => ({ newsletters: s.newsletters.map((n) => n.id === id ? { ...n, saved: !n.saved } : n) }))
  },
  toggleSaveViralPost: (id) => {
    set((s) => ({ viralPosts: s.viralPosts.map((p) => p.id === id ? { ...p, saved: !p.saved } : p) }))
  },

  // Settings
  updateSettings: (updates) => {
    set((s) => ({ settings: { ...s.settings, ...updates } }))
    get().saveToStorage()
  },
  updateLLMSettings: (updates) => {
    set((s) => ({ settings: { ...s.settings, llm: { ...s.settings.llm, ...updates } } }))
    get().saveToStorage()
  },

  // UI
  setActiveView: (view) => set({ activeView: view }),
  setSelectedProject: (id) => set({ selectedProjectId: id }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setLoading: (loading) => set({ isLoading: loading }),
  addNotification: (n) => {
    const notif: AppNotification = { ...n, id: uuidv4(), timestamp: new Date().toISOString() }
    set((s) => ({ notifications: [...s.notifications, notif] }))
    setTimeout(() => get().removeNotification(notif.id), 4000)
  },
  removeNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  // Persistence
  loadFromStorage: async () => {
    try {
      const api = (window as any).electronAPI
      if (api) {
        const data = await api.storeGet()
        if (data && Object.keys(data).length > 0) {
          set((s) => ({
            projects: data.projects || s.projects,
            tasks: data.tasks || s.tasks,
            timeBlocks: data.timeBlocks || s.timeBlocks,
            milestones: data.milestones || s.milestones,
            visionBoards: data.visionBoards || s.visionBoards,
            healthMetrics: data.healthMetrics || s.healthMetrics,
            healthGoals: data.healthGoals || s.healthGoals,
            viralPosts: data.viralPosts || s.viralPosts,
            settings: data.settings ? { ...s.settings, ...data.settings, llm: { ...s.settings.llm, ...(data.settings.llm || {}) } } : s.settings,
          }))
        }
      } else {
        // Browser fallback
        const raw = localStorage.getItem('pt-data')
        if (raw) {
          const data = JSON.parse(raw)
          set((s) => ({ ...s, ...data }))
        }
      }
    } catch (e) {
      console.error('Failed to load from storage', e)
    }
  },
  saveToStorage: async () => {
    try {
      const s = get()
      const data = {
        projects: s.projects, tasks: s.tasks, timeBlocks: s.timeBlocks,
        milestones: s.milestones, visionBoards: s.visionBoards,
        healthMetrics: s.healthMetrics, healthGoals: s.healthGoals,
        viralPosts: s.viralPosts, settings: s.settings,
      }
      const api = (window as any).electronAPI
      if (api) {
        await api.storeSet(data)
      } else {
        localStorage.setItem('pt-data', JSON.stringify(data))
      }
    } catch (e) {
      console.error('Failed to save to storage', e)
    }
  },

  exportData: () => {
    const s = get()
    return JSON.stringify({
      app: 'pt-time-block-timeline',
      exportedAt: new Date().toISOString(),
      projects: s.projects, tasks: s.tasks, timeBlocks: s.timeBlocks,
      milestones: s.milestones, visionBoards: s.visionBoards,
      healthMetrics: s.healthMetrics, healthGoals: s.healthGoals,
      viralPosts: s.viralPosts, settings: s.settings,
    }, null, 2)
  },

  importData: (json) => {
    try {
      const data = JSON.parse(json)
      // Accept both raw backups and files exported by exportData.
      if (typeof data !== 'object' || data === null) return false
      const hasAny = ['projects', 'tasks', 'timeBlocks', 'milestones', 'visionBoards', 'healthMetrics', 'healthGoals', 'viralPosts', 'settings']
        .some((k) => k in data)
      if (!hasAny) return false
      set((s) => ({
        projects: Array.isArray(data.projects) ? data.projects : s.projects,
        tasks: Array.isArray(data.tasks) ? data.tasks : s.tasks,
        timeBlocks: Array.isArray(data.timeBlocks) ? data.timeBlocks : s.timeBlocks,
        milestones: Array.isArray(data.milestones) ? data.milestones : s.milestones,
        visionBoards: Array.isArray(data.visionBoards) ? data.visionBoards : s.visionBoards,
        healthMetrics: Array.isArray(data.healthMetrics) ? data.healthMetrics : s.healthMetrics,
        healthGoals: Array.isArray(data.healthGoals) ? data.healthGoals : s.healthGoals,
        viralPosts: Array.isArray(data.viralPosts) ? data.viralPosts : s.viralPosts,
        settings: data.settings
          ? { ...s.settings, ...data.settings, llm: { ...s.settings.llm, ...(data.settings.llm || {}) } }
          : s.settings,
      }))
      get().saveToStorage()
      return true
    } catch {
      return false
    }
  },

  clearAllData: () => {
    set({
      projects: [], tasks: [], timeBlocks: [], milestones: [],
      visionBoards: [], healthMetrics: [], viralPosts: [],
      settings: defaultSettings,
    })
    get().saveToStorage()
  },
}))
