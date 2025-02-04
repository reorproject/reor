import * as fs from 'fs'
import * as path from 'path'

import { ipcMain, dialog, app } from 'electron'
import Store from 'electron-store'

import WindowsManager from '../common/windowManager'
import { StoreSchema } from '../electron-store/storeConfig'
import { handleFileRename, updateFileInTable } from '../vector-database/tableHelperFunctions'

import { GetFilesInfoTree, createFileRecursive, isHidden, GetFilesInfoListForListOfPaths } from './filesystem'
import { FileInfoTree, WriteFileProps, RenameFileProps, FileInfoWithContent } from './types'
import ImageStorage from './storage/ImageStore'
import VideoStorage from './storage/VideoStore'

const imageStorage = new ImageStorage(app.getPath('userData'))
const videoStorage = new VideoStorage(app.getPath('userData'))

const registerFileHandlers = (store: Store<StoreSchema>, _windowsManager: WindowsManager) => {
  const windowsManager = _windowsManager
  ipcMain.handle('get-files-tree-for-window', async (event): Promise<FileInfoTree> => {
    const directoryPath = windowsManager.getVaultDirectoryForWinContents(event.sender)
    if (!directoryPath) return []

    const files: FileInfoTree = GetFilesInfoTree(directoryPath)
    return files
  })

  ipcMain.handle('read-file', async (event, filePath, encoding = 'utf-8') => {
    try {
      const data = fs.promises.readFile(filePath, encoding)
      return data
    } catch (error) {
      console.error('Failed to read file:', error)
      throw error
    }
  })

  ipcMain.handle('check-file-exists', async (event, filePath) => {
    try {
      // Attempt to access the file to check existence
      await fs.promises.access(filePath, fs.constants.F_OK)
      // If access is successful, return true
      return true
    } catch (error) {
      // If an error occurs (e.g., file doesn't exist), return false
      return false
    }
  })

  ipcMain.handle('delete-file', async (event, filePath: string): Promise<void> => {
    fs.stat(filePath, async (err, stats) => {
      if (err) {
        return
      }

      if (stats.isDirectory()) {
        // For directories (Node.js v14.14.0 and later)
        fs.rm(filePath, { recursive: true }, () => {
          // hi
        })

        const windowInfo = windowsManager.getWindowInfoForContents(event.sender)
        if (!windowInfo) {
          throw new Error('Window info not found.')
        }
        await windowInfo.dbTableClient.deleteDBItemsByFilePaths([filePath])
      } else {
        fs.unlink(filePath, () => {
          // hi
        })

        const windowInfo = windowsManager.getWindowInfoForContents(event.sender)
        if (!windowInfo) {
          throw new Error('Window info not found.')
        }
        await windowInfo.dbTableClient.deleteDBItemsByFilePaths([filePath])
      }
    })
  })

  ipcMain.handle('write-file', async (event, writeFileProps: WriteFileProps) => {
    if (!fs.existsSync(path.dirname(writeFileProps.filePath))) {
      fs.mkdirSync(path.dirname(writeFileProps.filePath), {
        recursive: true,
      })
    }
    fs.writeFileSync(writeFileProps.filePath, writeFileProps.content, 'utf-8')
  })

  ipcMain.handle('store-image', async (event, imageData: string, originalName: string, blockID: string) => {
    try {
      const localURL = await imageStorage.storeMedia(imageData, originalName, blockID)
      return localURL
    } catch (error) {
      console.error(`Failed to store image:`, error)
      throw new Error(`Failed to store image`)
    }
  })

  ipcMain.handle('get-image', async (event, fileName) => {
    try {
      const imageData = await imageStorage.getMedia(fileName)
      return imageData
    } catch (error) {
      console.error(`Failed to get image:`, error)
      throw new Error(`Failed to get image`)
    }
  })

  ipcMain.handle('store-video', async (event, videoData, originalName, blockId) => {
    try {
      const localURL = await videoStorage.storeMedia(videoData, originalName, blockId)
      return localURL
    } catch (error) {
      console.error(`Failed to store video:`, error)
      throw new Error(`Failed to store video`)
    }
  })

  ipcMain.handle('get-video', async (event, fileName) => {
    try {
      const videoData = await videoStorage.getMedia(fileName)
      return videoData
    } catch (error) {
      console.error(`Failed to get video:`, error)
      throw new Error(`Failed to get video`)
    }
  })

  ipcMain.handle('is-directory', (event, filepath: string) => fs.statSync(filepath).isDirectory())

  ipcMain.handle('rename-file', async (event, renameFileProps: RenameFileProps) => {
    const windowInfo = windowsManager.getWindowInfoForContents(event.sender)

    if (!windowInfo) {
      throw new Error('Window info not found.')
    }

    await handleFileRename(windowsManager, windowInfo, renameFileProps, event.sender)
  })

  ipcMain.handle('index-file-in-database', async (event, filePath: string) => {
    const windowInfo = windowsManager.getWindowInfoForContents(event.sender)
    if (!windowInfo) {
      throw new Error('Window info not found.')
    }
    await updateFileInTable(windowInfo.dbTableClient, filePath)
  })

  ipcMain.handle('create-file', async (event, filePath: string, content: string): Promise<void> => {
    createFileRecursive(filePath, content, 'utf-8')
  })

  ipcMain.handle('create-directory', async (event, dirPath: string): Promise<void> => {
    const mkdirRecursiveSync = (_dirPath: string) => {
      const parentDir = path.dirname(_dirPath)
      if (!fs.existsSync(parentDir)) {
        mkdirRecursiveSync(parentDir)
      }
      if (!fs.existsSync(_dirPath)) {
        fs.mkdirSync(_dirPath)
      }
    }

    if (!fs.existsSync(dirPath)) {
      mkdirRecursiveSync(dirPath)
    }
  })

  ipcMain.handle('get-files', async (_event, filePaths: string[]): Promise<FileInfoWithContent[]> => {
    const fileItems = GetFilesInfoListForListOfPaths(filePaths)
    const fileContents = fileItems.map((fileItem) => fs.readFileSync(fileItem.path, 'utf-8'))
    return fileItems.map((fileItem, index) => ({ ...fileItem, content: fileContents[index] }))
  })

  ipcMain.handle('get-files-in-directory', (event, dirName: string) => {
    const itemsInDir = fs.readdirSync(dirName).filter((item) => !isHidden(item))
    return itemsInDir
  })

  ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
    })
    if (!result.canceled) {
      return result.filePaths
    }
    return null
  })

  ipcMain.handle('open-file-dialog', async (event, extensions) => {
    const filters = extensions && extensions.length > 0 ? [{ name: 'Files', extensions }] : []

    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections', 'showHiddenFiles'], // Add 'showHiddenFiles' here
      filters,
    })

    if (!result.canceled) {
      return result.filePaths
    }
    return []
  })

  // Similar to open-file-dialog except it filters out non-images
  ipcMain.handle('open-img-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }],
    })
    return result.filePaths
  })

  // Similar to open-file-dialog except it filters out non-videos
  ipcMain.handle('open-video-file-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: ['mp4', 'mkv'] }],
    })
    return result.filePaths
  })
}

export default registerFileHandlers
