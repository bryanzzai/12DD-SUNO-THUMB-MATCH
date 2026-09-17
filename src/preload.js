const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('coverMatcher', {
  chooseFolder: (kind) => ipcRenderer.invoke('choose-folder', kind),
  chooseOutput: () => ipcRenderer.invoke('choose-output'),
  exportCovers: (payload) => ipcRenderer.invoke('export-covers', payload),
  onProgress: (callback) => ipcRenderer.on('export-progress', (_event, progress) => callback(progress))
});
