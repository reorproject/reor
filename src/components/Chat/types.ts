import { CoreMessage } from 'ai'
import { DBEntry } from 'electron/main/vector-database/schema'

export type ReorChatMessage = CoreMessage & {
  context?: DBEntry[]
  visibleContent?: string
}

export type Chat = {
  [x: string]: any // used to delete legacy properties in store migrator.
  id: string
  messages: ReorChatMessage[]
}

export interface ChatFilters {
  numberOfChunksToFetch: number
  files: string[]
  numItems: number
  minDate?: Date
  maxDate?: Date
  dateFilter: string
}

export interface AnonymizedChatFilters {
  numberOfChunksToFetch: number
  filesLength: number
  minDate?: Date
  maxDate?: Date
}
