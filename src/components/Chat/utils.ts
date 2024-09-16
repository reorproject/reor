import { DBEntry } from 'electron/main/vector-database/schema'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import getDisplayableChatName from '@shared/utils'
import { AssistantContent, CoreToolMessage, ToolCallPart } from 'ai'
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
      role: 'system',
      content: `You are a helpful assistant helping a user organize and manage their personal knowledge and notes. 
You will answer the user's question and help them with their request. 
You can search the knowledge base by using the search tool and create new notes by using the create note tool.

An initial query has been made and the context is already provided for you (so please do not call the search tool initially).`,
      hideMessageInChat: true,
    },
    {
      role: 'user',
      context: results,
      content: `Context retrieved from your knowledge base for the query below: \n${contextString}\n\n\nQuery for context above:\n${query}`,
      visibleContent: query,
    },
  ]
}

export const appendNewMessageToChat = async (
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

export const getClassNameBasedOnMessageRole = (message: ReorChatMessage): string => {
  return `markdown-content ${message.role}-chat-message`
}

export const getDisplayMessage = (message: ReorChatMessage): string | undefined => {
  if (message.hideMessageInChat) {
    return undefined
  }
  if (message.visibleContent !== null && message.visibleContent !== undefined && message.visibleContent !== '') {
    return message.visibleContent
  }
  if (typeof message.content === 'string') {
    return message.content
  }
  return undefined
}

export const findToolResultMatchingToolCall = (toolCallId: string, currentChat: Chat): CoreToolMessage | undefined => {
  return currentChat.messages.find(
    (message) => message.role === 'tool' && message.content.some((content) => content.toolCallId === toolCallId),
  ) as CoreToolMessage | undefined
}
