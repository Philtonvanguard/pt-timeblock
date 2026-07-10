const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // External links
  openExternal: (url) => ipcRenderer.send('open-external', url),

  // File dialog
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

  // CLI execution
  runCLI: (command) => ipcRenderer.invoke('run-cli', command),

  // Data persistence
  storeGet: () => ipcRenderer.invoke('store-get'),
  storeSet: (data) => ipcRenderer.invoke('store-set', data),

  // App info
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Platform info
  platform: process.platform,
})
