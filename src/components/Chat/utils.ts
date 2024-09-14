import { DBEntry } from 'electron/main/vector-database/schema'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import getDisplayableChatName from '@shared/utils'
import { AssistantContent, ToolCallPart } from 'ai'
import { AnonymizedChatFilters, Chat, ChatFilters, ReorChatMessage } from './types'
import { createNoteTool, searchTool } from './tools'
import { retreiveFromVectorDB } from '@/utils/db'

export const appendTextContentToMessages = (
  messages: ReorChatMessage[],
  content: string | ToolCallPart[],
): ReorChatMessage[] => {
  if (content === '' || (Array.isArray(content) && content.length === 0)) {
    return messages
  }

  const appendContent = (existingContent: AssistantContent, newContent: string | ToolCallPart[]): AssistantContent => {
    if (typeof existingContent === 'string') {
      return typeof newContent === 'string'
        ? existingContent + newContent
        : [{ type: 'text' as const, text: existingContent }, ...newContent]
    }
    return [
      ...existingContent,
      ...(typeof newContent === 'string' ? [{ type: 'text' as const, text: newContent }] : newContent),
    ]
  }

  if (messages.length === 0) {
    return [
      {
        role: 'assistant',
        content: typeof content === 'string' ? content : content,
      },
    ]
  }

  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role === 'assistant') {
    return [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: appendContent(lastMessage.content, content),
      },
    ]
  }

  return [
    ...messages,
    {
      role: 'assistant',
      content: typeof content === 'string' ? content : content,
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

const generateStringOfContextItemsForPrompt = (contextItems: DBEntry[] | FileInfoWithContent[]): string => {
  return contextItems.map((item) => item.content).join('\n\n')
}

export const generateRAGMessages = async (query: string, chatFilters: ChatFilters): Promise<ReorChatMessage[]> => {
  let results: DBEntry[] | FileInfoWithContent[] = []
  if (chatFilters.files.length > 0) {
    results = await window.fileSystem.getFiles(chatFilters.files)
  } else {
    results = await retreiveFromVectorDB(query, chatFilters)
  }
  const contextString = generateStringOfContextItemsForPrompt(results)
  return [
    {
      role: 'user',
      context: results,
      content: `Based on the following context answer the question down below. \n\n\nContext: \n${contextString}\n\n\nQuery:\n${query}`,
      visibleContent: query,
    },
  ]
}

export const prepareOutputChat = async (
  currentChat: Chat | undefined,
  userTextFieldInput: string,
  chatFilters?: ChatFilters,
): Promise<Chat> => {
  let outputChat = currentChat

  if (!outputChat || !outputChat.id) {
    const newID = Date.now().toString()
    outputChat = {
      id: newID,
      messages: [],
      displayName: '',
      timeOfLastMessage: Date.now(),
      toolDefinitions: [],
    }
  }

  if (outputChat.messages.length === 0 && chatFilters) {
    const ragMessages = await generateRAGMessages(userTextFieldInput ?? '', chatFilters)
    outputChat.messages.push(...ragMessages)
    outputChat.displayName = getDisplayableChatName(outputChat.messages)
    outputChat.toolDefinitions = [searchTool, createNoteTool]
  } else {
    outputChat.messages.push({
      role: 'user',
      content: userTextFieldInput,
      context: [],
    })
  }

  return outputChat
}

// export const getChatHistoryContext = (chatHistory: Chat | undefined): DBQueryResult[] => {
//   if (!chatHistory || !chatHistory.messages) return []
//   const contextForChat = chatHistory.messages.map((message) => message.context).flat()
//   return contextForChat as DBQueryResult[]
// }

export function anonymizeChatFiltersForPosthog(
  chatFilters: ChatFilters | undefined,
): AnonymizedChatFilters | undefined {
  if (!chatFilters) {
    return undefined
  }
  const { limit: numberOfChunksToFetch, files, minDate, maxDate } = chatFilters
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
