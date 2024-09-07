import { CoreMessage } from 'ai'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'

export type ReorChatMessage = CoreMessage & {
  context?: DBEntry[] | FileInfoWithContent[]
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
  minDate?: Date
  maxDate?: Date
  passFullNoteIntoContext?: boolean
}

export interface AnonymizedChatFilters {
  numberOfChunksToFetch: number
  filesLength: number
  minDate?: Date
  maxDate?: Date
}
