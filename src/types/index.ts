// ─── Core Entity Types ────────────────────────────────────────────────────────

export type Priority = 'high' | 'medium' | 'low'
export type Status = 'todo' | 'in-progress' | 'done' | 'blocked'
export type LLMModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-5-sonnet' | 'claude-3-haiku' | 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'custom'

// ─── Projects ────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  description: string
  color: string
  icon: string
  status: Status
  priority: Priority
  startDate: string
  dueDate: string
  tags: string[]
  llmPrompt?: string
  createdAt: string
  updatedAt: string
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  projectId?: string
  title: string
  description: string
  status: Status
  priority: Priority
  dueDate?: string
  estimatedMinutes?: number
  actualMinutes?: number
  tags: string[]
  subtasks: Subtask[]
  llmPrompt?: string
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  id: string
  title: string
  done: boolean
}

// ─── Time Blocks ──────────────────────────────────────────────────────────────

export interface TimeBlock {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  color: string
  category: 'work' | 'health' | 'personal' | 'learning' | 'admin' | 'deep-work' | 'meeting' | 'break'
  taskId?: string
  projectId?: string
  notes?: string
  llmPrompt?: string
  recurring?: 'none' | 'daily' | 'weekly'
  createdAt: string
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface Milestone {
  id: string
  projectId: string
  title: string
  date: string
  color: string
  completed: boolean
  description?: string
}

// ─── Vision Board ─────────────────────────────────────────────────────────────

export interface VisionItem {
  id: string
  type: 'image' | 'text' | 'quote' | 'goal'
  content: string
  x: number
  y: number
  width: number
  height: number
  color?: string
  fontSize?: number
  fontWeight?: string
  category?: string
  createdAt: string
}

export interface VisionBoard {
  id: string
  name: string
  items: VisionItem[]
  background: string
  createdAt: string
  updatedAt: string
}

// ─── Health Pro ───────────────────────────────────────────────────────────────

export interface HealthMetric {
  id: string
  date: string
  type: 'sleep' | 'water' | 'exercise' | 'nutrition' | 'mood' | 'steps' | 'weight' | 'meditation'
  value: number
  unit: string
  notes?: string
}

export interface HealthGoal {
  id: string
  type: string
  target: number
  unit: string
  frequency: 'daily' | 'weekly'
  current: number
}

export interface WellnessRecommendation {
  id: string
  category: 'morning' | 'nutrition' | 'movement' | 'mindset' | 'evening' | 'productivity'
  title: string
  description: string
  duration?: string
  priority: Priority
  completed: boolean
  date: string
}

// ─── Automation ───────────────────────────────────────────────────────────────

export interface EmailConfig {
  provider: 'gmail' | 'outlook' | 'imap'
  host?: string
  port?: number
  username: string
  password: string
  tls: boolean
}

export interface EmailSummary {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  category: 'important' | 'newsletter' | 'promotional' | 'social' | 'update'
  read: boolean
  actionRequired: boolean
}

export interface Newsletter {
  id: string
  source: string
  title: string
  summary: string
  url: string
  publishedAt: string
  tags: string[]
  saved: boolean
}

export interface ViralPost {
  id: string
  platform: 'twitter' | 'linkedin' | 'instagram' | 'threads' | 'facebook'
  content: string
  hook: string
  hashtags: string[]
  generatedAt: string
  topic: string
  tone: 'professional' | 'casual' | 'inspirational' | 'educational' | 'entertaining'
  saved: boolean
}

// ─── LLM Settings ─────────────────────────────────────────────────────────────

export interface LLMSettings {
  enabled: boolean
  model: LLMModel
  apiKey: string
  customEndpoint?: string
  temperature: number
  maxTokens: number
  categoryPrompts: {
    projects: string
    tasks: string
    timeblock: string
    timeline: string
    health: string
    emails: string
    newsletters: string
    viralPosts: string
    visionboard: string
  }
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'dark' | 'light'
  accentColor: string
  startOfWeek: 'sunday' | 'monday'
  workingHours: { start: string; end: string }
  notifications: boolean
  autoSync: boolean
  syncInterval: number
  emailConfig?: EmailConfig
  rssFeeds: string[]
  llm: LLMSettings
}

// ─── App Store State ──────────────────────────────────────────────────────────

export interface AppState {
  // Data
  projects: Project[]
  tasks: Task[]
  timeBlocks: TimeBlock[]
  milestones: Milestone[]
  visionBoards: VisionBoard[]
  healthMetrics: HealthMetric[]
  healthGoals: HealthGoal[]
  wellnessRecs: WellnessRecommendation[]
  emails: EmailSummary[]
  newsletters: Newsletter[]
  viralPosts: ViralPost[]
  settings: AppSettings

  // UI State
  activeView: string
  selectedProjectId: string | null
  selectedDate: string
  sidebarCollapsed: boolean
  isLoading: boolean
  notifications: AppNotification[]
}

export interface AppNotification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  timestamp: string
}
