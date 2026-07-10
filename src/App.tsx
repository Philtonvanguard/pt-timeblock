import { useEffect, useState } from 'react'
import { Menu, Sparkles } from 'lucide-react'
import { useAppStore } from './store/appStore'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/layout/Dashboard'
import { ProjectsView } from './components/projects/ProjectsView'
import { TasksView } from './components/tasks/TasksView'
import { TimeBlockView } from './components/timeblock/TimeBlockView'
import { TimelineView } from './components/timeline/TimelineView'
import { VisionBoardView } from './components/visionboard/VisionBoardView'
import { HealthProView } from './components/health/HealthProView'
import { AutomationView } from './components/automation/AutomationView'
import { SettingsView } from './components/settings/SettingsView'
import { NotificationStack } from './components/layout/NotificationStack'
import { StorageNotice } from './components/layout/StorageNotice'
import { isElectron } from './lib/platform'
import { useMediaQuery } from './hooks/useMediaQuery'
import { motion } from 'framer-motion'

const views: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  projects: ProjectsView,
  tasks: TasksView,
  timeblock: TimeBlockView,
  timeline: TimelineView,
  visionboard: VisionBoardView,
  health: HealthProView,
  automation: AutomationView,
  settings: SettingsView,
}

const viewTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  tasks: 'Tasks',
  timeblock: 'Time Blocks',
  timeline: 'Timeline',
  visionboard: 'Vision Board',
  health: 'Health Pro',
  automation: 'Automation',
  settings: 'Settings',
}

export default function App() {
  const { activeView, loadFromStorage } = useAppStore()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  useEffect(() => {
    loadFromStorage()
  }, [])

  // Close the mobile drawer whenever we grow into the desktop layout.
  useEffect(() => {
    if (isDesktop) setMobileNavOpen(false)
  }, [isDesktop])

  const ActiveView = views[activeView] || Dashboard

  return (
    // h-dvh (not h-screen/100vh): on mobile browsers 100vh includes the area
    // behind the collapsing address bar, which cut off the bottom of the app.
    <div className="flex flex-col h-dvh bg-surface-900 overflow-hidden">
      {/* Native window chrome only inside the Electron desktop build */}
      {isElectron && <TitleBar />}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          isDesktop={isDesktop}
        />

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Mobile / tablet top bar with hamburger */}
          <header className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-white/5 bg-surface-800 flex-shrink-0 z-30">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="text-slate-300 hover:text-white p-1 -ml-1"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Sparkles size={12} className="text-black" />
              </div>
              <span className="text-sm font-semibold text-white truncate">
                {viewTitles[activeView] || 'PT Time Block'}
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-hidden relative">
            {/* No AnimatePresence mode="wait" here: gating the swap on the exit
                animation left the app stuck on the old view whenever animation
                frames stalled (backgrounded tabs, some mobile browsers). A
                keyed entrance-only fade keeps the transition without the risk. */}
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full overflow-hidden"
            >
              <ActiveView />
            </motion.div>
          </main>
        </div>
      </div>

      <NotificationStack />
      <StorageNotice />
    </div>
  )
}
