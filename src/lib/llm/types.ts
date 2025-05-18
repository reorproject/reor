import { CoreMessage } from 'ai'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'

export type ReorChatMessage = CoreMessage & {
  context?: DBEntry[] | FileInfoWithContent[]
  hideMessage?: boolean
  visibleContent?: string
}

type ParameterType = 'string' | 'number' | 'boolean'

type ToolParameter = {
  name: string
  type: ParameterType
  optional?: boolean
  defaultValue?: string | number | boolean
  description: string
}

export type ToolDefinition = {
  name: string
  displayName?: string
  description: string
  parameters: ToolParameter[]
  autoExecute?: boolean
}

export type Chat = {
  [x: string]: any // used to delete legacy properties in store migrator.
  id: string
  messages: ReorChatMessage[]
  displayName: string
  timeOfLastMessage: number
  toolDefinitions: ToolDefinition[]
}

export type ChatMetadata = Omit<Chat, 'messages'>

export interface DatabaseSearchFilters {
  limit: number
  minDate?: Date
  maxDate?: Date
  passFullNoteIntoContext?: boolean
}

export type PromptTemplate = {
  role: 'system' | 'user'
  content: string
}[]

export type AgentConfig = {
  name: string
  dbSearchFilters?: DatabaseSearchFilters
  files: string[]
  propertiesToIncludeInContext?: string[]
  toolDefinitions: ToolDefinition[]
  promptTemplate: PromptTemplate
}

export interface AnonymizedAgentConfig {
  name: string
  numberOfChunksToFetch?: number
  filesLength: number
  minDate?: Date
  maxDate?: Date
  toolNames: string[]
}

export type LoadingState = 'idle' | 'generating' | 'waiting-for-first-token'

export type FileMetadata = {
  id: string // Unique identifier for the file
  fileName: string // Name of the file
  absolutePath: string // Absolute path to the file
  modifiedAt: string // Last modified date of the file
}
