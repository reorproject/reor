import { CoreMessage } from 'ai'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'

export type ReorChatMessage = CoreMessage & {
  context?: DBEntry[] | FileInfoWithContent[]
  visibleContent?: string // what to display in the chat bubble
  hideMessageInChat?: boolean
}

type ParameterType = 'string' | 'number' | 'boolean'

type ToolParameter = {
  name: string
  type: ParameterType
  defaultValue?: string | number | boolean
  description: string
}

export type ToolDefinition = {
  name: string
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

export interface SearchFilters {
  limit: number
  minDate?: Date
  maxDate?: Date
  passFullNoteIntoContext?: boolean
}

export type ChatFilters = SearchFilters & {
  files: string[]
  propertiesToIncludeInContext?: string[]
}

export interface AnonymizedChatFilters {
  numberOfChunksToFetch: number
  filesLength: number
  minDate?: Date
  maxDate?: Date
}

export type LoadingState = 'idle' | 'generating' | 'waiting-for-first-token'
