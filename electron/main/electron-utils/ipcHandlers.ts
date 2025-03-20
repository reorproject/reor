import { app, ipcMain, shell } from 'electron'
import Store from 'electron-store'

import WindowsManager from '../common/windowManager'
import { StoreSchema } from '../electron-store/storeConfig'

const registerElectronUtilsHandlers = (
  store: Store<StoreSchema>,
  windowsManager: WindowsManager,
  preload: string,
  url: string | undefined,
  indexHtml: string,
) => {
  ipcMain.handle('open-external', (event, _url) => {
    shell.openExternal(_url)
  })

  ipcMain.handle('get-platform', async () => process.platform)

  ipcMain.handle('open-new-window', () => {
    windowsManager.createWindow(store, preload, url, indexHtml)
  })

  ipcMain.handle('get-reor-app-version', async () => app.getVersion())

  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData');
  });
}

export default registerElectronUtilsHandlers
