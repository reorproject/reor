import path from 'path'

import { ipcMain } from 'electron'

import { markdownExtensions } from '../filesystem/filesystem'

import addExtensionToFilenameIfNoExtensionPresent from './path'

const registerPathHandlers = () => {
  ipcMain.handle('path-basename', (event, pathString: string) => path.basename(pathString))

  ipcMain.handle('path-sep', () => path.sep)

  ipcMain.handle('join-path', (event, ...args) => path.join(...args))

  ipcMain.handle('path-dirname', (event, pathString: string) => path.dirname(pathString))

  ipcMain.handle('path-relative', (event, from: string, to: string) => path.relative(from, to))

  ipcMain.handle('path-absolute', (event, filePath: string) => path.isAbsolute(filePath))

  ipcMain.handle('add-extension-if-no-extension-present', (event, pathString: string) =>
    addExtensionToFilenameIfNoExtensionPresent(pathString, markdownExtensions, '.md'),
  )

  ipcMain.handle('path-ext-name', (event, pathString: string) => path.extname(pathString))

  ipcMain.handle('find-absolute-path', (event, filePath: string) => {
    const absolutePath = path.resolve(filePath)
    return absolutePath
  })
}

export default registerPathHandlers
