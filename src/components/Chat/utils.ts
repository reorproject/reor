import { DBEntry, DBQueryResult } from 'electron/main/vector-database/schema'
import { ChatCompletionContentPart } from 'openai/resources/chat/completions'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { AnonymizedChatFilters, Chat, ChatFilters, ReorChatMessage } from './types'

export function formatOpenAIMessageContentIntoString(
  content: string | ChatCompletionContentPart[] | null | undefined,
): string | undefined {
  if (Array.isArray(content)) {
    return content.reduce((acc, part) => {
      if (part.type === 'text') {
        return acc + part.text // Concatenate text parts
      }
      return acc // Skip image parts
    }, '')
  }
  return content || undefined
}

// function replaceContentInMessages(
//   messages: ChatMessageToDisplay[],
//   context: ChatProperties
// ): ChatMessageToDisplay[] {
//   return messages.map((message) => {
//     if ("content" in message) {
//       if (typeof message.content === "string") {
//         message.content = message.content.replace(
//           /\{(\w+)\}/g,
//           (match, key) => {
//             return key in context ? context[key] : match;
//           }
//         );
//       }
//     }
//     return message;
//   });
// }

// const ragPromptTemplate: ChatCompletionMessageParam[] = [
//   {
//     content:
//       "You are an advanced question answer agent answering questions based on provided context.",
//     role: "system",
//   },
//   {
//     content: `
// Context:
// {context}

// Query:
// {query}`,
//     role: "user",
//   },
// ];

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

export const resolveRAGContext = async (query: string, chatFilters: ChatFilters): Promise<ReorChatMessage> => {
  let results: DBEntry[] = []
  if (chatFilters.files.length > 0) {
    results = await window.fileSystem.getFilesystemPathsAsDBItems(chatFilters.files)
  } else if (chatFilters.numberOfChunksToFetch > 0) {
    const timeStampFilter = generateTimeStampFilter(chatFilters.minDate, chatFilters.maxDate)
    results = await window.database.search(query, chatFilters.numberOfChunksToFetch, timeStampFilter)
  }
  return {
    role: 'user',
    context: results,
    content: `Based on the following context answer the question down below. \n\n\nContext: \n${results
      .map((dbItem) => dbItem.content)
      .join('\n\n')}\n\n\nQuery:\n${query}`,
    visibleContent: query,
  }
}

export const getChatHistoryContext = (chatHistory: Chat | undefined): DBQueryResult[] => {
  if (!chatHistory || !chatHistory.messages) return []
  const contextForChat = chatHistory.messages.map((message) => message.context).flat()
  return contextForChat as DBQueryResult[]
}

export const getDisplayableChatName = (chat: Chat): string => {
  if (!chat.messages || chat.messages.length === 0 || !chat.messages[chat.messages.length - 1].content) {
    return 'Empty Chat'
  }

  const lastMsg = chat.messages[0]

  if (lastMsg.visibleContent) {
    return lastMsg.visibleContent.slice(0, 30)
  }

  const lastMessage = lastMsg.content
  if (!lastMessage || lastMessage === '' || typeof lastMessage !== 'string') {
    return 'Empty Chat'
  }
  return lastMessage.slice(0, 30)
}

export function anonymizeChatFiltersForPosthog(chatFilters: ChatFilters): AnonymizedChatFilters {
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
