import * as fs from 'fs'
import * as path from 'path'

import { app, BrowserWindow, ipcMain } from 'electron'
import Store from 'electron-store'
import * as lancedb from 'vectordb'

import errorToStringMainProcess from '../common/error'
import WindowsManager from '../common/windowManager'
import { getDefaultEmbeddingModelConfig } from '../electron-store/ipcHandlers'
import { StoreKeys, StoreSchema } from '../electron-store/storeConfig'
import { startWatchingDirectory, updateFileListForRenderer } from '../filesystem/filesystem'
import { createPromptWithContextLimitFromContent } from '../llm/contextLimit'
import { ollamaService, openAISession } from '../llm/ipcHandlers'
import { getLLMConfig } from '../llm/llmConfig'

import { rerankSearchedEmbeddings } from './embeddings'
import { DBEntry, DatabaseFields } from './schema'
import { formatTimestampForLanceDB, RepopulateTableWithMissingItems } from './tableHelperFunctions'

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

  ipcMain.handle(
    'augment-prompt-with-temporal-agent',
    async (event, { query, llmName }: BasePromptRequirements): Promise<PromptWithRagResults> => {
      const llmSession = openAISession
      const llmConfig = await getLLMConfig(store, ollamaService, llmName)

      if (!llmConfig) {
        throw new Error(`LLM ${llmName} not configured.`)
      }

      const llmFilter = await llmSession.response(
        llmName,
        llmConfig,
        [
          {
            role: 'system',
            content: `You are an experienced SQL engineer. You are translating natural language queries into temporal filters for a database query.

Below are 2 examples:

Query:
Summarize all notes modified after March 16, 2024, 1:00 PM.

Filter:
${DatabaseFields.FILE_MODIFIED} > timestamp '2024-03-16 13:00:00'

Query:
Find all files modified after today.

Filter:
${DatabaseFields.FILE_MODIFIED} > ${formatTimestampForLanceDB(new Date())}

For your reference, the timestamp right now is ${formatTimestampForLanceDB(
              new Date(),
            )}.Please generate ONLY the temporal filter using the same format as the example given. Please also make sure you only use the ${
              DatabaseFields.FILE_MODIFIED
            } field in the filter. If you don't know or there is no temporal component in the query, please return an empty string.`,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        false,
        store.get(StoreKeys.LLMGenerationParameters),
      )

      try {
        let searchResults: DBEntry[] = []
        const maxRAGExamples: number = store.get(StoreKeys.MaxRAGExamples)
        const windowInfo = windowManager.getWindowInfoForContents(event.sender)
        if (!windowInfo) {
          throw new Error('Window info not found.')
        }

        const llmGeneratedFilterString = llmFilter.choices[0].message.content ?? ''

        try {
          searchResults = await windowInfo.dbTableClient.search(query, maxRAGExamples, llmGeneratedFilterString)
        } catch (error) {
          searchResults = await windowInfo.dbTableClient.search(query, maxRAGExamples)
          searchResults = []
        }
        const basePrompt = 'Answer the question below based on the following notes:\n'
        const { prompt: ragPrompt } = createPromptWithContextLimitFromContent(
          searchResults,
          basePrompt,
          query,
          llmSession.getTokenizer(llmName),
          llmConfig.contextLength,
        )

        const uniqueFilesReferenced = [...new Set(searchResults.map((entry) => entry.notepath))]

        return {
          ragPrompt,
          uniqueFilesReferenced,
        }
      } catch (error) {
        throw new Error(errorToStringMainProcess(error))
      }
    },
  )

  ipcMain.handle(
    'augment-prompt-with-flashcard-agent',
    async (
      event,
      { query, llmName, filePathToBeUsedAsContext }: BasePromptRequirements,
    ): Promise<PromptWithRagResults> => {
      const llmSession = openAISession

      const llmConfig = await getLLMConfig(store, ollamaService, llmName)

      if (!llmConfig) {
        throw new Error(`LLM ${llmName} not configured.`)
      }
      if (!filePathToBeUsedAsContext) {
        throw new Error('Current file path is not provided for flashcard agent.')
      }
      const fileResults = fs.readFileSync(filePathToBeUsedAsContext, 'utf-8')
      const { prompt: promptToCreateAtomicFacts } = createPromptWithContextLimitFromContent(
        fileResults,
        '',
        `Extract atomic facts that can be used for students to study, based on this query: ${query}`,
        llmSession.getTokenizer(llmName),
        llmConfig.contextLength,
      )
      const llmGeneratedFacts = await llmSession.response(
        llmName,
        llmConfig,
        [
          {
            role: 'system',
            content: `You are an experienced teacher reading through some notes a student has made and extracting atomic facts. You never come up with your own facts. You generate atomic facts directly from what you read.
            An atomic fact is a fact that relates to a single piece of knowledge and makes it easy to create a question for which the atomic fact is the answer"`,
          },
          {
            role: 'user',
            content: promptToCreateAtomicFacts,
          },
        ],
        false,
        store.get(StoreKeys.LLMGenerationParameters),
      )

      const basePrompt = 'Given the following atomic facts:\n'
      const flashcardQuery =
        'Create useful FLASHCARDS that can be used for students to study using ONLY the context. Format is Q: <insert question> A: <insert answer>.'
      const { prompt: promptToCreateFlashcardsWithAtomicFacts } = createPromptWithContextLimitFromContent(
        llmGeneratedFacts.choices[0].message.content || '',
        basePrompt,
        flashcardQuery,
        llmSession.getTokenizer(llmName),
        llmConfig.contextLength,
      )

      const uniqueFilesReferenced = [filePathToBeUsedAsContext]

      return {
        ragPrompt: promptToCreateFlashcardsWithAtomicFacts,
        uniqueFilesReferenced,
      }
    },
  )

  ipcMain.handle('get-database-fields', () => DatabaseFields)
}
