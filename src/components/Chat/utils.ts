import { DBEntry } from 'electron/main/vector-database/schema'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import generateChatName from '@shared/utils'
import { AssistantContent, CoreAssistantMessage, CoreToolMessage, ToolCallPart } from 'ai'
import posthog from 'posthog-js'
import { AnonymizedAgentConfig, Chat, AgentConfig, PromptTemplate, ReorChatMessage } from './types'
import { retreiveFromVectorDB } from '@/utils/db'
import { createToolResult } from './tools'

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
export function anonymizeAgentConfigForPosthog(
  agentConfig: AgentConfig | undefined,
): AnonymizedAgentConfig | undefined {
  if (!agentConfig) {
    return undefined
  }
  const { limit: numberOfChunksToFetch, files, minDate, maxDate } = agentConfig
  return {
    name: agentConfig.name,
    numberOfChunksToFetch,
    filesLength: files.length,
    minDate,
    maxDate,
    toolNames: agentConfig.toolDefinitions.map((tool) => tool.name),
  }
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
    const replacePlaceholders = (content: string) => {
      return content.replace('{CONTEXT}', contextString).replace('{QUERY}', query)
    }

    if (message.role === 'system') {
      return {
        ...message,
        content: replacePlaceholders(message.content),
        hideMessageInChat: true,
      }
    }
    if (message.role === 'user') {
      return {
        ...message,
        context: results,
        content: replacePlaceholders(message.content),
        visibleContent: query,
      }
    }
    return message
  }) as ReorChatMessage[]
}

export const doInitialRAG = async (query: string, chatFilters: AgentConfig): Promise<ReorChatMessage[]> => {
  const { promptTemplate, files } = chatFilters

  const needsContext = promptTemplate.some((message) => message.content.includes('{CONTEXT}'))

  let results: DBEntry[] | FileInfoWithContent[] = []
  let contextString = ''

  if (needsContext) {
    if (files.length > 0) {
      results = await window.fileSystem.getFiles(files)
    } else {
      results = await retreiveFromVectorDB(query, chatFilters)
    }
    contextString = generateStringOfContextItemsForPrompt(results)
  }

  return applyPromptTemplate(promptTemplate, contextString, query, results)
}

export const generateInitialChat = async (userTextFieldInput: string, agentConfig: AgentConfig): Promise<Chat> => {
  const ragMessages = await doInitialRAG(userTextFieldInput ?? '', agentConfig)

  return {
    id: Date.now().toString(),
    messages: ragMessages,
    displayName: generateChatName(ragMessages),
    timeOfLastMessage: Date.now(),
    toolDefinitions: agentConfig.toolDefinitions,
  }
}
export const appendToOrCreateChat = async (
  currentChat: Chat | undefined,
  userTextFieldInput: string,
  agentConfig?: AgentConfig,
): Promise<Chat> => {
  let outputChat = currentChat

  if (!outputChat || !outputChat.id || outputChat.messages.length === 0) {
    outputChat = await generateInitialChat(
      userTextFieldInput ?? '',
      agentConfig || { name: '', toolDefinitions: [], limit: 15, files: [], promptTemplate: [] },
    ) // TODO: probably split into an initial chat function and an append to chat function
    const anonymizedAgentConfig = anonymizeAgentConfigForPosthog(agentConfig)
    posthog.capture('chat_message_submitted', {
      chatId: outputChat?.id,
      chatLength: outputChat?.messages.length,
      ...anonymizedAgentConfig,
    })
  } else {
    outputChat.messages.push({
      role: 'user',
      content: userTextFieldInput,
      context: [],
    })
    posthog.capture('follow_up_chat_message_submitted', {
      chatId: outputChat?.id,
      chatLength: outputChat?.messages.length,
    })
  }

  return outputChat
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

export const findToolResultMatchingToolCall = (
  toolCallId: string,
  messages: ReorChatMessage[],
): CoreToolMessage | undefined => {
  return messages.find(
    (message) => message.role === 'tool' && message.content.some((content) => content.toolCallId === toolCallId),
  ) as CoreToolMessage | undefined
}

export function extractMessagePartsFromAssistantMessage(message: CoreAssistantMessage) {
  const outputTextParts: string[] = []
  const outputToolCalls: ToolCallPart[] = []

  if (typeof message.content === 'string') {
    outputTextParts.push(getDisplayMessage(message) || '')
  } else if (Array.isArray(message.content)) {
    message.content.forEach((part) => {
      if ('text' in part) {
        outputTextParts.push(part.text)
      } else if (part.type === 'tool-call') {
        outputToolCalls.push(part)
      }
    })
  }

  return { textParts: outputTextParts, toolCalls: outputToolCalls }
}

export const removeUncalledToolsFromMessages = (messages: ReorChatMessage[]): ReorChatMessage[] => {
  return messages.map((message) => {
    if (message.role === 'assistant') {
      const { textParts, toolCalls } = extractMessagePartsFromAssistantMessage(message)
      const toolCallsWithResults: ToolCallPart[] = toolCalls.filter((toolCall) => {
        return findToolResultMatchingToolCall(toolCall.toolCallId, messages)
      })
      const assistantContent: AssistantContent = [
        ...textParts.map((textPart) => ({ type: 'text' as const, text: textPart })),
        ...toolCallsWithResults,
      ]
      const msgOut: ReorChatMessage = {
        ...message,
        content: assistantContent,
      }
      return msgOut
    }
    return message
  })
}

export const addToolResultToMessages = async (
  messages: ReorChatMessage[],
  toolCallPart: ToolCallPart,
  assistantMessage: ReorChatMessage,
): Promise<ReorChatMessage[]> => {
  const toolResult = await createToolResult(toolCallPart.toolName, toolCallPart.args as any, toolCallPart.toolCallId)

  const toolMessage: CoreToolMessage = {
    role: 'tool',
    content: [toolResult],
  }

  const assistantIndex = messages.findIndex((msg) => msg === assistantMessage)
  if (assistantIndex === -1) {
    throw new Error('Assistant message not found')
  }

  return [...messages.slice(0, assistantIndex + 1), toolMessage, ...messages.slice(assistantIndex + 1)]
}
