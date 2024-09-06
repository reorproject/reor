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
  // <<<<<<< HEAD
  //   ipcMain.handle('show-context-menu-file-item', async (event, file: FileInfoNode) => {
  //     const menu = new Menu()

  //     menu.append(
  //       new MenuItem({
  //         label: 'Delete',
  //         click: () =>
  //           dialog
  //             .showMessageBox({
  //               type: 'question',
  //               title: 'Delete File',
  //               message: `Are you sure you want to delete "${file.name}"?`,
  //               buttons: ['Yes', 'No'],
  //             })
  //             .then((confirm) => {
  //               if (confirm.response === 0) {
  //                 event.sender.send('delete-file-listener', file.path)
  //               }
  //             }),
  //       }),
  //     )
  //     menu.append(
  //       new MenuItem({
  //         label: 'Rename',
  //         click: () => {
  //           event.sender.send('rename-file-listener', file.path)
  //         },
  //       }),
  //     )

  //     menu.append(
  //       new MenuItem({
  //         label: 'Create a flashcard set',
  //         click: () => {
  //           event.sender.send('create-flashcard-file-listener', file.path)
  //         },
  //       }),
  //     )

  //     menu.append(
  //       new MenuItem({
  //         label: 'Add file to chat context',
  //         click: () => {
  //           event.sender.send('add-file-to-chat-listener', file.path)
  //         },
  //       }),
  //     )

  //     const browserWindow = BrowserWindow.fromWebContents(event.sender)
  //     if (browserWindow) {
  //       menu.popup({ window: browserWindow })
  //     }
  //   })

  //   ipcMain.handle('show-chat-menu-item', (event, chatRow: ChatMetadata) => {
  //     const menu = new Menu()

  //     menu.append(
  //       new MenuItem({
  //         label: 'Delete Chat',
  //         click: () => {
  //           const vaultDir = windowsManager.getVaultDirectoryForWinContents(event.sender)

  //           if (!vaultDir) {
  //             return
  //           }

  //           const chatHistoriesMap = store.get(StoreKeys.ChatHistories)
  //           const allChatHistories = chatHistoriesMap[vaultDir] || []
  //           const filteredChatHistories = allChatHistories.filter((item) => item.id !== chatRow.id)
  //           chatHistoriesMap[vaultDir] = filteredChatHistories
  //           store.set(StoreKeys.ChatHistories, chatHistoriesMap)
  //           event.sender.send('update-chat-histories', chatHistoriesMap[vaultDir] || [])
  //         },
  //       }),
  //     )

  //     const browserWindow = BrowserWindow.fromWebContents(event.sender)
  //     if (browserWindow) menu.popup({ window: browserWindow })
  //   })

  // =======
  // >>>>>>> move-context-menu
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
