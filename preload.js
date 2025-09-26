const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('privacyAPI', {
  search: (query) => ipcRenderer.invoke('search', query),
  openPrivacyMode: () => ipcRenderer.send('privacy-mode')
});
