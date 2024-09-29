import { DBEntry } from 'electron/main/vector-database/schema'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import generateChatName from '@shared/utils'
import { AssistantContent, CoreAssistantMessage, CoreToolMessage, ToolCallPart } from 'ai'
import posthog from 'posthog-js'
import { AnonymizedAgentConfig, Chat, AgentConfig, PromptTemplate, ReorChatMessage, ToolDefinition } from './types'
import { retreiveFromVectorDB } from '@/utils/db'
import { createToolResult } from './tools'

export const appendStringContentToMessages = (messages: ReorChatMessage[], content: string): ReorChatMessage[] => {
  if (content === '') {
    return messages
  }

  if (messages.length === 0) {
    return [
      {
        role: 'assistant',
        content,
      },
    ]
  }

  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role === 'assistant') {
    return [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content:
          typeof lastMessage.content === 'string'
            ? lastMessage.content + content
            : [...lastMessage.content, { type: 'text' as const, text: content }],
      },
    ]
  }

  return [
    ...messages,
    {
      role: 'assistant',
      content,
    },
  ]
}

export const appendToolCallPartsToMessages = (
  messages: ReorChatMessage[],
  toolCalls: ToolCallPart[],
): ReorChatMessage[] => {
  if (toolCalls.length === 0) {
    return messages
  }

  if (messages.length === 0) {
    return [
      {
        role: 'assistant',
        content: toolCalls,
      },
    ]
  }

  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role === 'assistant') {
    return [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: Array.isArray(lastMessage.content)
          ? [...lastMessage.content, ...toolCalls]
          : [{ type: 'text' as const, text: lastMessage.content }, ...toolCalls],
      },
    ]
  }

  return [
    ...messages,
    {
      role: 'assistant',
      content: toolCalls,
    },
  ]
}

export const makeAndAddToolResultToMessages = async (
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

const autoExecuteTools = async (
  messages: ReorChatMessage[],
  toolDefinitions: ToolDefinition[],
  toolCalls: ToolCallPart[],
) => {
  const toolsThatNeedExecuting = toolCalls.filter((toolCall) => {
    const toolDefinition = toolDefinitions.find((definition) => definition.name === toolCall.toolName)
    return toolDefinition?.autoExecute
  })
  let outputMessages = messages
  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role !== 'assistant') {
    throw new Error('Last message is not an assistant message')
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const toolCall of toolsThatNeedExecuting) {
    // eslint-disable-next-line no-await-in-loop
    outputMessages = await makeAndAddToolResultToMessages(outputMessages, toolCall, lastMessage)
  }
  const allToolCallsHaveBeenExecuted =
    toolsThatNeedExecuting.length > 0 && toolsThatNeedExecuting.length === toolCalls.length
  return { messages: outputMessages, allToolCallsHaveBeenExecuted }
}

export const appendToolCallsAndAutoExecuteTools = async (
  messages: ReorChatMessage[],
  toolDefinitions: ToolDefinition[],
  toolCalls: ToolCallPart[],
): Promise<{ messages: ReorChatMessage[]; allToolCallsHaveBeenExecuted: boolean }> => {
  const messagesWithToolCalls = appendToolCallPartsToMessages(messages, toolCalls)
  const { messages: messagesWithToolResults, allToolCallsHaveBeenExecuted } = await autoExecuteTools(
    messagesWithToolCalls,
    toolDefinitions,
    toolCalls,
  )
  return { messages: messagesWithToolResults, allToolCallsHaveBeenExecuted }
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
  const { dbSearchFilters, files } = agentConfig
  return {
    name: agentConfig.name,
    numberOfChunksToFetch: dbSearchFilters?.limit ?? 0,
    filesLength: files.length,
    minDate: dbSearchFilters?.minDate,
    maxDate: dbSearchFilters?.maxDate,
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

export const doInitialRAG = async (query: string, agentConfig: AgentConfig): Promise<ReorChatMessage[]> => {
  const { promptTemplate, files } = agentConfig

  const needsContext = promptTemplate.some((message) => message.content.includes('{CONTEXT}'))

  let results: DBEntry[] | FileInfoWithContent[] = []
  let contextString = ''

  if (needsContext) {
    if (files.length > 0) {
      results = await window.fileSystem.getFiles(files)
    } else if (agentConfig.dbSearchFilters) {
      results = await retreiveFromVectorDB(query, agentConfig.dbSearchFilters)
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
    displayName: generateChatName(ragMessages, userTextFieldInput),
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
    if (!agentConfig) {
      throw new Error('Agent config is required')
    }
    outputChat = await generateInitialChat(userTextFieldInput ?? '', agentConfig)
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
