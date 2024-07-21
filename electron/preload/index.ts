import { contextBridge, ipcRenderer } from 'electron'
import {
  EmbeddingModelConfig,
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
  HardwareConfig,
  LLMConfig,
  LLMGenerationParameters,
  Tab,
} from 'electron/main/electron-store/storeConfig'
import {
  AugmentPromptWithFileProps,
  FileInfoNode,
  FileInfoTree,
  RenameFileProps,
  WriteFileProps,
} from 'electron/main/filesystem/types'
import { PromptWithContextLimit } from 'electron/main/llm/contextLimit'
import { BasePromptRequirements, PromptWithRagResults } from 'electron/main/vector-database/ipcHandlers'
import { DBEntry, DBQueryResult } from 'electron/main/vector-database/schema'

import { ChatHistoryMetadata } from '@/components/Chat/hooks/use-chat-history'
import { ChatHistory } from '@/components/Chat/chatUtils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IPCHandler<T extends (...args: any[]) => any> = (...args: Parameters<T>) => Promise<ReturnType<T>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createIPCHandler<T extends (...args: any[]) => any>(channel: string): IPCHandler<T> {
  return (...args: Parameters<T>) => ipcRenderer.invoke(channel, ...args) as Promise<ReturnType<T>>
}

const database = {
  search: createIPCHandler<(query: string, limit: number, filter?: string) => Promise<DBQueryResult[]>>('search'),
  searchWithReranking:
    createIPCHandler<(query: string, limit: number, filter?: string) => Promise<DBQueryResult[]>>(
      'search-with-reranking',
    ),
  deleteLanceDBEntriesByFilePath: createIPCHandler<(filePath: string) => Promise<void>>(
    'delete-lance-db-entries-by-filepath',
  ),
  indexFilesInDirectory: createIPCHandler<() => Promise<void>>('index-files-in-directory'),
  augmentPromptWithTemporalAgent: createIPCHandler<(args: BasePromptRequirements) => Promise<PromptWithRagResults>>(
    'augment-prompt-with-temporal-agent',
  ),
  augmentPromptWithFlashcardAgent: createIPCHandler<(args: BasePromptRequirements) => Promise<PromptWithRagResults>>(
    'augment-prompt-with-flashcard-agent',
  ),
  getDatabaseFields: createIPCHandler<() => Promise<Record<string, string>>>('get-database-fields'),
}

const electronUtils = {
  openExternal: createIPCHandler<(url: string) => Promise<void>>('open-external'),
  getPlatform: createIPCHandler<() => Promise<string>>('get-platform'),
  openNewWindow: createIPCHandler<() => Promise<void>>('open-new-window'),
  getReorAppVersion: createIPCHandler<() => Promise<string>>('get-reor-app-version'),
  showFileItemContextMenu: createIPCHandler<(file: FileInfoNode) => Promise<void>>('show-context-menu-file-item'),
  showMenuItemContext: createIPCHandler<() => Promise<void>>('show-context-menu-item'),
  showChatItemContext: createIPCHandler<(chatRow: ChatHistoryMetadata) => Promise<void>>('show-chat-menu-item'),
  showCreateFileModal: createIPCHandler<(relativePath: string) => Promise<void>>('empty-new-note-listener'),
  showCreateDirectoryModal: createIPCHandler<(relativePath: string) => Promise<void>>('empty-new-directory-listener'),
}

const electronStore = {
  setVaultDirectoryForWindow: createIPCHandler<(path: string) => Promise<void>>('set-vault-directory-for-window'),
  getVaultDirectoryForWindow: createIPCHandler<() => Promise<string>>('get-vault-directory-for-window'),
  getDefaultEmbeddingModel: createIPCHandler<() => Promise<string>>('get-default-embedding-model'),
  setDefaultEmbeddingModel: createIPCHandler<(repoName: string) => Promise<void>>('set-default-embedding-model'),
  addNewLocalEmbeddingModel: createIPCHandler<(model: EmbeddingModelWithLocalPath) => Promise<void>>(
    'add-new-local-embedding-model',
  ),
  getEmbeddingModels: createIPCHandler<() => Promise<Record<string, EmbeddingModelConfig>>>('get-embedding-models'),
  addNewRepoEmbeddingModel:
    createIPCHandler<(model: EmbeddingModelWithRepo) => Promise<void>>('add-new-repo-embedding-model'),
  updateEmbeddingModel:
    createIPCHandler<
      (modelName: string, updatedModel: EmbeddingModelWithLocalPath | EmbeddingModelWithRepo) => Promise<void>
    >('update-embedding-model'),
  removeEmbeddingModel: createIPCHandler<(modelName: string) => Promise<void>>('remove-embedding-model'),
  getNoOfRAGExamples: createIPCHandler<() => Promise<number>>('get-no-of-rag-examples'),
  setNoOfRAGExamples: createIPCHandler<(noOfExamples: number) => Promise<void>>('set-no-of-rag-examples'),
  getChunkSize: createIPCHandler<() => Promise<number>>('get-chunk-size'),
  setChunkSize: createIPCHandler<(chunkSize: number) => Promise<void>>('set-chunk-size'),
  getHardwareConfig: createIPCHandler<() => Promise<HardwareConfig>>('get-hardware-config'),
  setHardwareConfig: createIPCHandler<(config: HardwareConfig) => Promise<void>>('set-hardware-config'),
  getLLMGenerationParams: createIPCHandler<() => Promise<LLMGenerationParameters>>('get-llm-generation-params'),
  setLLMGenerationParams:
    createIPCHandler<(params: LLMGenerationParameters) => Promise<void>>('set-llm-generation-params'),
  getAnalyticsMode: createIPCHandler<() => Promise<boolean>>('get-analytics-mode'),
  setAnalyticsMode: createIPCHandler<(isAnalytics: boolean) => Promise<void>>('set-analytics-mode'),
  getSpellCheckMode: createIPCHandler<() => Promise<boolean>>('get-spellcheck-mode'),
  setSpellCheckMode: createIPCHandler<(isSpellCheck: boolean) => Promise<void>>('set-spellcheck-mode'),
  getHasUserOpenedAppBefore: createIPCHandler<() => Promise<boolean>>('has-user-opened-app-before'),
  setHasUserOpenedAppBefore: createIPCHandler<() => Promise<void>>('set-user-has-opened-app-before'),
  getAllChatHistories: createIPCHandler<() => Promise<ChatHistory[]>>('get-all-chat-histories'),
  updateChatHistory: createIPCHandler<(chatHistory: ChatHistory) => Promise<void>>('update-chat-history'),
  removeChatHistoryAtID: createIPCHandler<(chatID: string) => Promise<void>>('remove-chat-history-at-id'),
  getChatHistory: createIPCHandler<(chatID: string) => Promise<ChatHistory>>('get-chat-history'),
  getSBCompact: createIPCHandler<() => Promise<boolean>>('get-sb-compact'),
  setSBCompact: createIPCHandler<(isSBCompact: boolean) => Promise<void>>('set-sb-compact'),
  getDisplayMarkdown: createIPCHandler<() => Promise<boolean>>('get-display-markdown'),
  setDisplayMarkdown: createIPCHandler<(displayMarkdown: boolean) => Promise<void>>('set-display-markdown'),
  getEditorFlexCenter: createIPCHandler<() => Promise<boolean>>('get-editor-flex-center'),
  setEditorFlexCenter: createIPCHandler<(editorFlexCenter: boolean) => Promise<void>>('set-editor-flex-center'),
  getCurrentOpenFiles: createIPCHandler<() => Promise<Tab[]>>('get-current-open-files'),
  setCurrentOpenFiles: createIPCHandler<(action: string, args: any) => Promise<void>>('set-current-open-files'),
}

const fileSystem = {
  openDirectoryDialog: createIPCHandler<() => Promise<string[]>>('open-directory-dialog'),
  openFileDialog: createIPCHandler<(fileExtensions?: string[]) => Promise<string[]>>('open-file-dialog'),
  getFilesTreeForWindow: createIPCHandler<() => Promise<FileInfoTree>>('get-files-tree-for-window'),
  writeFile: createIPCHandler<(writeFileProps: WriteFileProps) => Promise<void>>('write-file'),
  isDirectory: createIPCHandler<(filePath: string) => Promise<boolean>>('is-directory'),
  renameFileRecursive: createIPCHandler<(renameFileProps: RenameFileProps) => Promise<void>>('rename-file-recursive'),
  indexFileInDatabase: createIPCHandler<(filePath: string) => Promise<void>>('index-file-in-database'),
  createFile: createIPCHandler<(filePath: string, content: string) => Promise<void>>('create-file'),
  createDirectory: createIPCHandler<(dirPath: string) => Promise<void>>('create-directory'),
  readFile: createIPCHandler<(filePath: string) => Promise<string>>('read-file'),
  checkFileExists: createIPCHandler<(filePath: string) => Promise<boolean>>('check-file-exists'),
  deleteFile: createIPCHandler<(filePath: string) => Promise<void>>('delete-file'),
  moveFileOrDir: createIPCHandler<(sourcePath: string, destinationPath: string) => Promise<void>>('move-file-or-dir'),
  augmentPromptWithFile:
    createIPCHandler<(augmentPromptWithFileProps: AugmentPromptWithFileProps) => Promise<PromptWithContextLimit>>(
      'augment-prompt-with-file',
    ),
  getFilesystemPathsAsDBItems: createIPCHandler<(paths: string[]) => Promise<DBEntry[]>>(
    'get-filesystem-paths-as-db-items',
  ),
  generateFlashcardsWithFile: createIPCHandler<(flashcardWithFileProps: AugmentPromptWithFileProps) => Promise<string>>(
    'generate-flashcards-from-file',
  ),
}

const path = {
  basename: createIPCHandler<(pathString: string) => Promise<string>>('path-basename'),
  join: createIPCHandler<(...pathSegments: string[]) => Promise<string>>('join-path'),
  dirname: createIPCHandler<(pathString: string) => Promise<string>>('path-dirname'),
  relative: createIPCHandler<(from: string, to: string) => Promise<string>>('path-relative'),
  addExtensionIfNoExtensionPresent: createIPCHandler<(pathString: string) => Promise<string>>(
    'add-extension-if-no-extension-present',
  ),
  pathSep: createIPCHandler<() => Promise<string>>('path-sep'),
  getAllFilenamesInDirectory: createIPCHandler<(dirName: string) => Promise<string[]>>('get-files-in-directory'),
  getAllFilenamesInDirectoryRecursively: createIPCHandler<(dirName: string) => Promise<string[]>>(
    'get-files-in-directory-recursive',
  ),
}

const llm = {
  streamingLLMResponse:
    createIPCHandler<
      (llmName: string, llmConfig: LLMConfig, isJSONMode: boolean, chatHistory: ChatHistory) => Promise<string>
    >('streaming-llm-response'),

  getLLMConfigs: createIPCHandler<() => Promise<LLMConfig[]>>('get-llm-configs'),
  pullOllamaModel: createIPCHandler<(modelName: string) => Promise<void>>('pull-ollama-model'),
  addOrUpdateLLM: createIPCHandler<(modelConfig: LLMConfig) => Promise<void>>('add-or-update-llm'),
  removeLLM: createIPCHandler<(modelNameToDelete: string) => Promise<void>>('remove-llm'),
  setDefaultLLM: createIPCHandler<(modelName: string) => Promise<void>>('set-default-llm'),
  getDefaultLLMName: createIPCHandler<() => Promise<string>>('get-default-llm-name'),
  sliceListOfStringsToContextLength: createIPCHandler<(strings: string[], llmName: string) => Promise<string[]>>(
    'slice-list-of-strings-to-context-length',
  ),
  sliceStringToContextLength: createIPCHandler<(inputString: string, llmName: string) => Promise<string>>(
    'slice-string-to-context-length',
  ),
}

// Expose to renderer process
contextBridge.exposeInMainWorld('database', database)
contextBridge.exposeInMainWorld('electronUtils', electronUtils)
contextBridge.exposeInMainWorld('electronStore', electronStore)
contextBridge.exposeInMainWorld('fileSystem', fileSystem)
contextBridge.exposeInMainWorld('path', path)
contextBridge.exposeInMainWorld('llm', llm)

// Additional exposures that don't fit the pattern above
contextBridge.exposeInMainWorld('ipcRenderer', {
  on: ipcRenderer.on.bind(ipcRenderer),
  receive: (channel: string, func: (...args: unknown[]) => void) => {
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => func(...args)
    ipcRenderer.on(channel, subscription)
    return () => {
      ipcRenderer.removeListener(channel, subscription)
    }
  },
})

// Type declarations
declare global {
  interface Window {
    database: typeof database
    electronUtils: typeof electronUtils
    electronStore: typeof electronStore
    fileSystem: typeof fileSystem
    path: typeof path
    llm: typeof llm
    ipcRenderer: {
      on: typeof ipcRenderer.on
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      receive: (channel: string, func: (...args: any[]) => void) => () => void
    }
  }
}
