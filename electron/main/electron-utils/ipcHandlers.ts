import { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem, shell } from 'electron'
import Store from 'electron-store'

import WindowsManager from '../common/windowManager'
import { StoreKeys, StoreSchema } from '../electron-store/storeConfig'
import { ChatHistoryMetadata } from '@/components/Chat/hooks/use-chat-history'
import { FileInfoNode } from '../filesystem/types'

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
}

export default registerElectronUtilsHandlers
