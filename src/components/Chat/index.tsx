import React, { useCallback, useEffect, useState, useRef } from 'react'

import posthog from 'posthog-js'

import { streamText } from 'ai'
import getDisplayableChatName from '@shared/utils'
import { anonymizeChatFiltersForPosthog, resolveLLMClient, generateRAGMessages } from './utils'

import '../../styles/chat.css'
import ChatMessages from './ChatMessages'
import { Chat, ChatFilters, LoadingState } from './types'
import { useChatContext } from '@/contexts/ChatContext'
import StartChat from './StartChat'

const ChatComponent: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [readyToSave, setReadyToSave] = useState<boolean>(false)
  const [defaultModelName, setDefaultLLMName] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined)
  const { updateChat, currentOpenChatID, setCurrentOpenChatID } = useChatContext()

  useEffect(() => {
    const fetchDefaultLLM = async () => {
      const defaultName = await window.llm.getDefaultLLMName()
      setDefaultLLMName(defaultName)
    }
    fetchDefaultLLM()
  }, [])

  useEffect(() => {
    const fetchChat = async () => {
      const chat = await window.electronStore.getChat(currentOpenChatID)
      setCurrentChat(chat)
      setLoadingState('idle')
    }
    fetchChat()
  }, [currentOpenChatID])

  useEffect(() => {
    if (readyToSave && currentChat) {
      updateChat(currentChat)
      setReadyToSave(false)
    }
  }, [readyToSave, currentChat, updateChat])

  const appendNewContentToMessageHistory = useCallback(
    (chatID: string, newContent: string) => {
      setCurrentChat((prev) => {
        if (chatID !== prev?.id) throw new Error('Chat ID does not match')
        const outputMessages = prev?.messages || []
        if (outputMessages.length > 0) {
          const lastMessage = outputMessages[outputMessages.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.content += newContent
          } else {
            outputMessages.push({
              role: 'assistant',
              content: newContent,
              context: [],
            })
          }
        } else {
          outputMessages.push({
            role: 'assistant',
            content: newContent,
            context: [],
          })
        }
        return {
          id: prev!.id,
          messages: outputMessages,
          displayName: getDisplayableChatName(outputMessages),
          timeOfLastMessage: prev.timeOfLastMessage,
        }
      })
    },
    [setCurrentChat],
  )

  const handleSubmitNewMessage = useCallback(
    async (userTextFieldInput: string, chatFilters?: ChatFilters) => {
      if (loadingState !== 'idle' || !userTextFieldInput?.trim()) return
      try {
        const defaultLLMName = await window.llm.getDefaultLLMName()
        let outputChat = currentChat

        if (!outputChat || !outputChat.id) {
          const newID = Date.now().toString()
          outputChat = {
            id: newID,
            messages: [],
            displayName: '',
            timeOfLastMessage: Date.now(),
          }
        }
        if (outputChat.messages.length === 0 && chatFilters) {
          const ragMessages = await generateRAGMessages(userTextFieldInput ?? '', chatFilters)
          outputChat.messages.push(...ragMessages)
          outputChat.displayName = getDisplayableChatName(outputChat.messages)
        } else {
          outputChat.messages.push({
            role: 'user',
            content: userTextFieldInput,
            context: [],
          })
        }

        setCurrentChat(outputChat)
        setCurrentOpenChatID(outputChat.id)

        await updateChat(outputChat)
        // const dbFields = await window.database.getDatabaseFields()

        const client = await resolveLLMClient(defaultLLMName)

        const { textStream } = await streamText({
          model: client,
          messages: outputChat.messages,
          // tools: {
          //   weather: tool({
          //     description: "Semnatically Search the user's notes",
          //     parameters: z.object({
          //       query: z.string().describe('The query to search for'),
          //       limit: z.number().default(10).describe('The number of results to return'),
          //       filter: z
          //         .string()
          //         .optional()
          //         .describe(
          //           `The filter to apply to the search. The columns available are: ${dbFields.FILE_MODIFIED} and ${dbFields.FILE_CREATED} which are both timestamps. An example filter would be ${dbFields.FILE_MODIFIED} > "2024-01-01" and ${dbFields.FILE_CREATED} < "2024-01-01".`,
          //         ),
          //     }),
          //     // execute: async ({ query, limit }) => {
          //     //   const results = await window.database.search(query, limit)
          //     //   return results
          //     // },
          //   }),
          // },
          onFinish: (event) => {
            console.log('tool calls', event.toolCalls)
            console.log('tool results', event.toolResults)
          },
        })

        // eslint-disable-next-line no-restricted-syntax
        for await (const text of textStream) {
          appendNewContentToMessageHistory(outputChat.id, text)
          setLoadingState('generating')
        }
        setLoadingState('idle')
        setReadyToSave(true)
        posthog.capture('chat_message_submitted', {
          chatId: currentChat?.id,
          chatLength: currentChat?.messages.length,
          chatFilters: anonymizeChatFiltersForPosthog(chatFilters),
        })
      } catch (error) {
        setLoadingState('idle')
        throw error
      }
    },
    [loadingState, currentChat, setCurrentOpenChatID, updateChat, appendNewContentToMessageHistory],
  )
  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-dark-gray-c-eleven">
        {currentChat && currentChat.messages && currentChat.messages.length > 0 ? (
          <ChatMessages
            currentChatHistory={currentChat}
            chatContainerRef={chatContainerRef}
            loadingState={loadingState}
            handleNewChatMessage={handleSubmitNewMessage}
          />
        ) : (
          <StartChat defaultModelName={defaultModelName} handleNewChatMessage={handleSubmitNewMessage} />
        )}
      </div>
    </div>
  )
}

export default ChatComponent
