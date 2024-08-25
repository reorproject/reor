import * as path from 'path'

import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import * as lancedb from 'vectordb'

import errorToStringMainProcess from '../common/error'
import WindowsManager from '../common/windowManager'
import { getDefaultEmbeddingModelConfig } from '../electron-store/ipcHandlers'
import { StoreSchema } from '../electron-store/storeConfig'
import { startWatchingDirectory, updateFileListForRenderer } from '../filesystem/filesystem'

import { rerankSearchedEmbeddings } from './embeddings'
import { DBEntry, DatabaseFields } from './schema'
import { RepopulateTableWithMissingItems } from './tableHelperFunctions'

export interface PromptWithRagResults {
  ragPrompt: string
  uniqueFilesReferenced: string[]
}

export interface BasePromptRequirements {
  query: string
  llmName: string
  filePathToBeUsedAsContext?: string
}

export const registerDBSessionHandlers = (store: Store<StoreSchema>, _windowManager: WindowsManager) => {
  let dbConnection: lancedb.Connection
  const windowManager = _windowManager

  ipcMain.handle('search', async (event, query: string, limit: number, filter?: string): Promise<DBEntry[]> => {
    const windowInfo = windowManager.getWindowInfoForContents(event.sender)
    if (!windowInfo) {
      throw new Error('Window info not found.')
    }
    const searchResults = await windowInfo.dbTableClient.search(query, limit, filter)
    return searchResults
  })

  ipcMain.handle('index-files-in-directory', async (event) => {
    try {
      const windowInfo = windowManager.getWindowInfoForContents(event.sender)
      if (!windowInfo) {
        throw new Error('No window info found')
      }
      const defaultEmbeddingModelConfig = getDefaultEmbeddingModelConfig(store)
      const dbPath = path.join(app.getPath('userData'), 'vectordb')
      dbConnection = await lancedb.connect(dbPath)

      await windowInfo.dbTableClient.initialize(
        dbConnection,
        windowInfo.vaultDirectoryForWindow,
        defaultEmbeddingModelConfig,
      )
      await RepopulateTableWithMissingItems(
        windowInfo.dbTableClient,
        windowInfo.vaultDirectoryForWindow,
        (progress) => {
          event.sender.send('indexing-progress', progress)
        },
      )
      const win = BrowserWindow.fromWebContents(event.sender)

      if (win) {
        windowManager.watcher = startWatchingDirectory(win, windowInfo.vaultDirectoryForWindow)
        updateFileListForRenderer(win, windowInfo.vaultDirectoryForWindow)
      }
      event.sender.send('indexing-progress', 1)
    } catch (error) {
      let errorStr = ''

      if (errorToStringMainProcess(error).includes('Embedding function error')) {
        errorStr = `${error}. Please try downloading an embedding model from Hugging Face and attaching it in settings. More information can be found in settings.`
      } else {
        errorStr = `${error}. Please try restarting or open a Github issue.`
      }
      event.sender.send('error-to-display-in-window', errorStr)
    }
  })

  ipcMain.handle(
    'search-with-reranking',
    async (event, query: string, limit: number, filter?: string): Promise<DBEntry[]> => {
      const windowInfo = windowManager.getWindowInfoForContents(event.sender)
      if (!windowInfo) {
        throw new Error('Window info not found.')
      }
      const searchResults = await windowInfo.dbTableClient.search(query, limit, filter)

      const rankedResults = await rerankSearchedEmbeddings(query, searchResults)
      return rankedResults
    },
  )

  ipcMain.handle('get-database-fields', () => DatabaseFields)
}
