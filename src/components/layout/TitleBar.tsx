import { Minus, Square, X, Zap } from 'lucide-react'

export function TitleBar() {
  const isElectron = !!(window as any).electronAPI
  const platform = (window as any).electronAPI?.platform

  const handleMinimize = () => (window as any).electronAPI?.minimize()
  const handleMaximize = () => (window as any).electronAPI?.maximize()
  const handleClose = () => (window as any).electronAPI?.close()

  return (
    <div className="drag-region h-10 flex items-center justify-between bg-surface-900 border-b border-white/5 px-4 flex-shrink-0 z-50">
      {/* Left: macOS controls or app name */}
      {platform === 'darwin' ? (
        <div className="no-drag flex items-center gap-2">
          <button onClick={handleClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
          <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
          <button onClick={handleMaximize} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-slate-400 tracking-wide">PT TIME BLOCK TIMELINE</span>
        </div>
      )}

      {/* Center: App title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        {platform === 'darwin' && (
          <>
            <div className="w-4 h-4 rounded bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap size={9} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-400 tracking-widest">PT TIME BLOCK TIMELINE</span>
          </>
        )}
      </div>

      {/* Right: Windows/Linux controls */}
      {isElectron && platform !== 'darwin' && (
        <div className="no-drag flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <Square size={12} />
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-500 text-slate-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
