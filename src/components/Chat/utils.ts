import { DBEntry, DBQueryResult } from 'electron/main/vector-database/schema'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { AnonymizedChatFilters, Chat, ChatFilters, ReorChatMessage } from './types'

export const appendTextContentToMessages = (messages: ReorChatMessage[], text: string): ReorChatMessage[] => {
  if (text === '') {
    return messages
  }
  if (messages.length === 0) {
    return [
      {
        role: 'assistant',
        content: text,
      },
    ]
  }
  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role === 'assistant') {
    return [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: lastMessage.content + text,
      },
    ]
  }
  return [
    ...messages,
    {
      role: 'assistant',
      content: text,
    },
  ]
}

export const convertMessageToString = (message: ReorChatMessage | undefined): string => {
  if (!message) {
    return ''
  }
  if (message.visibleContent) {
    return message.visibleContent
  }
  if (typeof message.content === 'string') {
    return message.content
  }
  return ''
}

export const generateTimeStampFilter = (minDate?: Date, maxDate?: Date): string => {
  let filter = ''

  if (minDate) {
    const minDateStr = minDate.toISOString().slice(0, 19).replace('T', ' ')
    filter += `filemodified > timestamp '${minDateStr}'`
  }

  if (maxDate) {
    const maxDateStr = maxDate.toISOString().slice(0, 19).replace('T', ' ')
    if (filter) {
      filter += ' AND '
    }
    filter += `filemodified < timestamp '${maxDateStr}'`
  }

  return filter
}

const fetchResults = async (query: string, chatFilters: ChatFilters): Promise<DBEntry[] | FileInfoWithContent[]> => {
  if (chatFilters.files.length > 0) {
    return window.fileSystem.getFileInfoWithContentsForPaths(chatFilters.files)
  }

  if (chatFilters.numberOfChunksToFetch > 0) {
    const timeStampFilter = generateTimeStampFilter(chatFilters.minDate, chatFilters.maxDate)
    const dbSearchResults = await window.database.search(query, chatFilters.numberOfChunksToFetch, timeStampFilter)

    if (chatFilters.passFullNoteIntoContext) {
      return window.fileSystem.getFileInfoWithContentsForPaths(dbSearchResults.map((result) => result.notepath))
    }
    return dbSearchResults
  }
  return []
}

const generateStringOfContextItems = (contextItems: DBEntry[] | FileInfoWithContent[]): string => {
  // properties: name, relativePath, dateModified, dateCreated
  return contextItems.map((item) => item.content).join('\n\n')
}

export const generateRAGMessages = async (query: string, chatFilters: ChatFilters): Promise<ReorChatMessage[]> => {
  const results = await fetchResults(query, chatFilters)
  const contextString = generateStringOfContextItems(results)
  return [
    {
      role: 'user',
      context: results,
      content: `Based on the following context answer the question down below. \n\n\nContext: \n${contextString}\n\n\nQuery:\n${query}`,
      visibleContent: query,
    },
  ]
}

export const getChatHistoryContext = (chatHistory: Chat | undefined): DBQueryResult[] => {
  if (!chatHistory || !chatHistory.messages) return []
  const contextForChat = chatHistory.messages.map((message) => message.context).flat()
  return contextForChat as DBQueryResult[]
}

export function anonymizeChatFiltersForPosthog(
  chatFilters: ChatFilters | undefined,
): AnonymizedChatFilters | undefined {
  if (!chatFilters) {
    return undefined
  }
  const { numberOfChunksToFetch, files, minDate, maxDate } = chatFilters
  return {
    numberOfChunksToFetch,
    filesLength: files.length,
    minDate,
    maxDate,
  }
}

export const resolveLLMClient = async (llmName: string) => {
  const llmConfigs = await window.llm.getLLMConfigs()
  const apiConfigs = await window.llm.getLLMAPIConfigs()

  const llmConfig = llmConfigs.find((llm) => llm.modelName === llmName)

  if (!llmConfig) {
    throw new Error(`LLM ${llmName} not found.`)
  }

  const apiConfig = apiConfigs.find((api) => api.name === llmConfig.apiName)

  if (!apiConfig) {
    throw new Error(`API ${llmConfig.apiName} not found.`)
  }

  if (apiConfig.apiInterface === 'openai') {
    const openai = createOpenAI({
      apiKey: apiConfig.apiKey || '',
      baseURL: apiConfig.apiURL,
    })
    return openai(llmName)
  }
  if (apiConfig.apiInterface === 'anthropic') {
    const anthropic = createAnthropic({
      apiKey: apiConfig.apiKey || '',
      baseURL: apiConfig.apiURL,
      headers: {
        'anthropic-dangerous-direct-browser-access': 'true',
      },
    })
    return anthropic(llmName)
  }
  throw new Error(`API interface ${apiConfig.apiInterface} not supported.`)
}

export const getClassNameBasedOnMessageRole = (message: ReorChatMessage): string => {
  return `markdown-content ${message.role}-chat-message`
}

export const getDisplayMessage = (message: ReorChatMessage): string | undefined => {
  return message.visibleContent || typeof message.content !== 'string' ? message.visibleContent : message.content
}
