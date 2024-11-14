/* eslint-disable no-param-reassign */
import { DBEntry } from 'electron/main/vector-database/schema'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { generateChatName } from '@shared/utils'
import { AssistantContent, CoreAssistantMessage, CoreToolMessage, ToolCallPart } from 'ai'
import posthog from 'posthog-js'
import { format } from 'date-fns'
import { AnonymizedAgentConfig, Chat, AgentConfig, PromptTemplate, ReorChatMessage } from './types'
import { retreiveFromVectorDB } from '@/lib/db'

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
  const contextString = contextItems.map((item) => JSON.stringify(item, null, 2)).join('\n\n')
  return `${contextString}`
}

const replaceTemplatePlaceholders = (content: string, userQuery: string) => {
  const now = new Date()
  const today = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
  return content.replace('{QUERY}', userQuery).replace('{TODAY}', today)
}

const generateMessagesFromTemplate = (
  promptTemplate: PromptTemplate,
  userQuery: string,
  contextItems: DBEntry[] | FileInfoWithContent[],
): ReorChatMessage[] => {
  return promptTemplate.map((templateMessage) => {
    if (templateMessage.role === 'system') {
      return {
        ...templateMessage,
        content: `${replaceTemplatePlaceholders(templateMessage.content, userQuery)}`,
        hideMessage: true,
      }
    }

    if (templateMessage.role === 'user') {
      return {
        ...templateMessage,
        context: contextItems,
        content: replaceTemplatePlaceholders(templateMessage.content, userQuery),
        visibleContent: userQuery,
      }
    }

    return templateMessage
  }) as ReorChatMessage[]
}

const injectContextStringIntoMessages = (
  messages: ReorChatMessage[],
  contextItems: DBEntry[] | FileInfoWithContent[],
  contextString: string,
): ReorChatMessage[] => {
  const lastUserMessage = messages.findLast((message) => message.role === 'user')
  if (lastUserMessage) {
    lastUserMessage.content = `The context retrieved from the user's knowledge base for the query is: ${contextString}\n\n${lastUserMessage.content}`
    lastUserMessage.context = contextItems
  }
  return messages
}

const retrieveContextItems = async (
  query: string,
  agentConfig: AgentConfig,
): Promise<DBEntry[] | FileInfoWithContent[]> => {
  const { files } = agentConfig

  if (files.length > 0) {
    return window.fileSystem.getFiles(files)
  }

  if (agentConfig.dbSearchFilters) {
    return retreiveFromVectorDB(query, agentConfig.dbSearchFilters)
  }

  return []
}

export const generateInitialChat = async (userTextFieldInput: string, agentConfig: AgentConfig): Promise<Chat> => {
  const contextItems = await retrieveContextItems(userTextFieldInput ?? '', agentConfig)

  const contextString = generateStringOfContextItemsForPrompt(contextItems)
  const messages = generateMessagesFromTemplate(agentConfig.promptTemplate, userTextFieldInput ?? '', contextItems)
  const ragMessages = injectContextStringIntoMessages(messages, contextItems, contextString)

  return {
    id: Date.now().toString(),
    messages: ragMessages,
    displayName: generateChatName(ragMessages, userTextFieldInput),
    timeOfLastMessage: Date.now(),
    toolDefinitions: agentConfig.toolDefinitions,
  }
}

const generateFollowUpChat = async (
  currentChat: Chat | undefined,
  userTextFieldInput: string,
  agentConfig: AgentConfig | undefined,
): Promise<Chat> => {
  if (!currentChat) {
    throw new Error('Current chat is required')
  }
  currentChat.messages.push({
    role: 'user',
    visibleContent: userTextFieldInput,
    content: `The user's query is: ${userTextFieldInput}`,
    context: [],
  })

  if (agentConfig) {
    const contextItems = await retrieveContextItems(userTextFieldInput ?? '', agentConfig)
    const contextString = generateStringOfContextItemsForPrompt(contextItems)
    currentChat.messages = injectContextStringIntoMessages(currentChat.messages, contextItems, contextString)
    currentChat.toolDefinitions = agentConfig.toolDefinitions
  }

  return currentChat
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
    outputChat = await generateFollowUpChat(outputChat, userTextFieldInput, agentConfig)
    posthog.capture('follow_up_chat_message_submitted', {
      chatId: outputChat?.id,
      chatLength: outputChat?.messages.length,
    })
  }

  return outputChat
}

export const getDisplayMessage = (message: ReorChatMessage): string | undefined => {
  if (message.hideMessage) {
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
