import { release } from 'node:os';
import { join } from 'node:path';

import { app, BrowserWindow } from 'electron';
import Store from 'electron-store';

import { errorToStringMainProcess } from './common/error';
import WindowsManager from './common/windowManager';
import { registerStoreHandlers } from './electron-store/ipcHandlers';
import { StoreSchema } from './electron-store/storeConfig';
import { electronUtilsHandlers } from './electron-utils/ipcHandlers';
import { registerFileHandlers } from './filesystem/ipcHandlers';
import { ollamaService, registerLLMSessionHandlers } from './llm/ipcHandlers';
import { pathHandlers } from './path/ipcHandlers';
import { registerDBSessionHandlers } from './vector-database/ipcHandlers';

const store = new Store<StoreSchema>();
// store.clear(); // clear store for testing CAUTION: THIS WILL DELETE YOUR CHAT HISTORY
const windowsManager = new WindowsManager();

process.env.DIST_ELECTRON = join(__dirname, '../');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, 'index.html');

app.whenReady().then(async () => {
  try {
    await ollamaService.init();
  } catch (error) {
    windowsManager.appendNewErrorToDisplayInWindow(
      errorToStringMainProcess(error),
    );
  }
  windowsManager.createWindow(store, preload, url, indexHtml);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async () => {
  ollamaService.stop();
});

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    windowsManager.createWindow(store, preload, url, indexHtml);
  }
});

registerLLMSessionHandlers(store);
registerDBSessionHandlers(store, windowsManager);
registerStoreHandlers(store, windowsManager);
registerFileHandlers(store, windowsManager);
electronUtilsHandlers(store, windowsManager, preload, url, indexHtml);
pathHandlers();
