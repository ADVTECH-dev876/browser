const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const { anonymizeSearch } = require('./search-proxy');

// Security hardening
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,Accelerated2dCanvas');
app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
      disableBlinkFeatures: 'Auxclick'
    }
  });

  // Load UI
  mainWindow.loadFile('ui/index.html');

  // Privacy hardening
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    delete details.requestHeaders['Referer'];
    delete details.requestHeaders['Origin'];
    details.requestHeaders['DNT'] = '1';
    callback({ requestHeaders: details.requestHeaders });
  });

  // Auto-clear cookies on close
  mainWindow.on('closed', () => {
    session.defaultSession.clearStorageData({
      storages: ['cookies', 'localstorage', 'cachestorage']
    });
  });
}

// Block ads/trackers
function enableAdBlock() {
  const rules = require('./privacy-rules.json');
  session.defaultSession.declarativeNetRequest.updateDynamicRules({
    addRules: rules.rules,
    removeRuleIds: rules.rules.map(r => r.id)
  });
}

// Fingerprinting mitigation
function mitigateFingerprinting() {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (['geolocation', 'notifications', 'camera', 'microphone'].includes(permission)) {
      return callback(false);
    }
    callback(true);
  });
}

app.whenReady().then(() => {
  createWindow();
  enableAdBlock();
  mitigateFingerprinting();

  // Handle encrypted search requests
  ipcMain.handle('search', async (event, query) => {
    return await anonymizeSearch(query);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
