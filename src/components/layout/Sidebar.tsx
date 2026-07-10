import {
  LayoutDashboard, FolderKanban, CheckSquare, Clock, GitBranch,
  Image, Heart, Zap, Settings, ChevronLeft, ChevronRight,
  Sparkles, X
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { isWeb } from '../../lib/platform'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, group: 'productivity' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, group: 'productivity' },
  { id: 'timeblock', label: 'Time Blocks', icon: Clock, group: 'productivity' },
  { id: 'timeline', label: 'Timeline', icon: GitBranch, group: 'productivity' },
  { id: 'visionboard', label: 'Vision Board', icon: Image, group: 'focus' },
  { id: 'health', label: 'Health Pro', icon: Heart, group: 'focus' },
  { id: 'automation', label: 'Automation', icon: Zap, group: 'automation' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'system' },
]

const groups = [
  { id: 'main', label: '' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'focus', label: 'Focus & Wellbeing' },
  { id: 'automation', label: 'Automation' },
  { id: 'system', label: 'System' },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
  isDesktop: boolean
}

export function Sidebar({ mobileOpen, onClose, isDesktop }: SidebarProps) {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar, settings } = useAppStore()

  // The Automation hub (email triage + RSS) is desktop-only. On the web build we
  // hide it rather than ship a feature that can't run in a browser.
  const visibleNav = navItems.filter((i) => !(isWeb && i.id === 'automation'))

  // Labels only collapse on the desktop layout; the mobile drawer is always full-width.
  const collapsed = isDesktop && sidebarCollapsed

  const handleNav = (id: string) => {
    setActiveView(id)
    if (!isDesktop) onClose()
  }

  const asideClasses = [
    'flex flex-col bg-surface-800 border-r border-white/5 overflow-hidden z-50',
    // Mobile: fixed slide-in drawer
    'fixed inset-y-0 left-0 w-[260px] max-w-[80vw] transition-transform duration-300 ease-in-out',
    mobileOpen ? 'translate-x-0' : '-translate-x-full',
    // Desktop: static column with width transition for collapse
    'lg:static lg:translate-x-0 lg:flex-shrink-0 lg:transition-[width] lg:max-w-none',
    collapsed ? 'lg:w-16' : 'lg:w-[220px]',
  ].join(' ')

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={asideClasses}>
        {/* Logo area */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 glow">
                <Sparkles size={14} className="text-black" />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-tight">PT Time Block</div>
                <div className="text-[10px] text-slate-500 leading-tight">Timeline</div>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto glow">
              <Sparkles size={14} className="text-black" />
            </div>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded text-slate-500 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollable py-2 px-2">
          {groups.map((group) => {
            const items = visibleNav.filter((i) => i.group === group.id)
            if (!items.length) return null
            return (
              <div key={group.id} className="mb-3">
                {group.label && !collapsed && (
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                    {group.label}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`nav-item w-full ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* LLM Status indicator */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-white/5">
            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${settings.llm.enabled ? 'bg-primary-500/10' : 'bg-white/5'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${settings.llm.enabled ? 'bg-primary-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-[10px] text-slate-500 truncate">
                {settings.llm.enabled ? `AI: ${settings.llm.model}` : 'AI: Disabled'}
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
