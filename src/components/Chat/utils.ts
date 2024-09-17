import { DBEntry } from 'electron/main/vector-database/schema'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import generateChatName from '@shared/utils'
import { AssistantContent, CoreToolMessage, ToolCallPart } from 'ai'
import { AnonymizedAgentConfig, Chat, AgentConfig, PromptTemplate, ReorChatMessage } from './types'
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

const applyPromptTemplate = (
  promptTemplate: PromptTemplate,
  contextString: string,
  query: string,
  results: DBEntry[] | FileInfoWithContent[],
): ReorChatMessage[] => {
  return promptTemplate.map((message) => {
    if (message.role === 'system') {
      return {
        ...message,
        hideMessageInChat: true,
      }
    }
    if (message.role === 'user') {
      return {
        ...message,
        context: results,
        content: message.content.replace('{CONTEXT}', contextString).replace('{QUERY}', query),
        visibleContent: query,
      }
    }
    return message
  }) as ReorChatMessage[]
}

export const doInitialRAG = async (query: string, chatFilters: AgentConfig): Promise<ReorChatMessage[]> => {
  let results: DBEntry[] | FileInfoWithContent[] = []
  if (chatFilters.files.length > 0) {
    results = await window.fileSystem.getFiles(chatFilters.files)
  } else {
    results = await retreiveFromVectorDB(query, chatFilters)
  }
  const contextString = generateStringOfContextItemsForPrompt(results)

  return applyPromptTemplate(chatFilters.promptTemplate, contextString, query, results)
}

export const generateInitialChat = async (userTextFieldInput: string, chatFilters: AgentConfig): Promise<Chat> => {
  const ragMessages = await doInitialRAG(userTextFieldInput ?? '', chatFilters)
  return {
    id: Date.now().toString(),
    messages: ragMessages,
    displayName: generateChatName(ragMessages),
    timeOfLastMessage: Date.now(),
    toolDefinitions: chatFilters.toolDefinitions,
  }
}
export const appendToOrCreateChat = async (
  currentChat: Chat | undefined,
  userTextFieldInput: string,
  chatFilters?: AgentConfig,
): Promise<Chat> => {
  let outputChat = currentChat

  if (!outputChat || !outputChat.id || outputChat.messages.length === 0) {
    outputChat = await generateInitialChat(
      userTextFieldInput ?? '',
      chatFilters || { toolDefinitions: [], limit: 15, files: [], promptTemplate: [] },
    ) // TODO: probably split into an initial chat function and an append to chat function
  } else {
    outputChat.messages.push({
      role: 'user',
      content: userTextFieldInput,
      context: [],
    })
  }

  return outputChat
}

export function anonymizeChatFiltersForPosthog(
  chatFilters: AgentConfig | undefined,
): AnonymizedAgentConfig | undefined {
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
