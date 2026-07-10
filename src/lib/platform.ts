// Runtime environment helpers.
// The Electron preload exposes `window.electronAPI`; in a normal browser it is undefined.
export const isElectron =
  typeof window !== 'undefined' && !!(window as any).electronAPI

export const isWeb = !isElectron

export const platform: string | undefined =
  typeof window !== 'undefined' ? (window as any).electronAPI?.platform : undefined
