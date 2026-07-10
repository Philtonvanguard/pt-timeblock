import { useState } from 'react'
import { HardDrive, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { isWeb } from '../../lib/platform'
import { useAppStore } from '../../store/appStore'

const DISMISS_KEY = 'pt-storage-notice-dismissed'

// Web-only first-run notice: the browser build keeps everything in this
// browser's local storage, so users need to know that clearing site data
// (or private browsing) erases it — and where the backup tools live.
export function StorageNotice() {
  const { setActiveView } = useAppStore()
  const [dismissed, setDismissed] = useState(() => {
    if (!isWeb) return true
    try {
      return localStorage.getItem(DISMISS_KEY) === '1'
    } catch {
      return true
    }
  })

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Private browsing may block writes; the banner will just show again.
    }
  }

  if (!isWeb) return null

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-[60]"
        >
          <div className="rounded-xl border border-primary-500/30 bg-surface-800/95 backdrop-blur-md p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/15 flex items-center justify-center flex-shrink-0">
                <HardDrive size={15} className="text-primary-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white mb-1">
                  Your data lives in this browser
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Everything you create is saved to this browser's local storage on
                  this device — nothing is sent to a server, and no tracking cookies
                  are used. Clearing this site's data or cookies, or using private
                  browsing, will erase it. Back up anytime from{' '}
                  <button
                    onClick={() => { setActiveView('settings'); dismiss() }}
                    className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
                  >
                    Settings → Data &amp; Storage
                  </button>
                  , or use the desktop app for file-based storage.
                </p>
                <button onClick={dismiss} className="btn-primary mt-3 !px-3 !py-1.5 text-xs">
                  Got it
                </button>
              </div>
              <button
                onClick={dismiss}
                aria-label="Dismiss storage notice"
                className="text-slate-500 hover:text-white p-1 -m-1 flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
