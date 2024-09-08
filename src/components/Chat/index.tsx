import React, { useCallback, useEffect, useState, useRef } from 'react'

import posthog from 'posthog-js'

import { streamText } from 'ai'
import {
  anonymizeChatFiltersForPosthog,
  resolveLLMClient,
  prepareOutputChat,
  appendTextContentToMessages,
} from './utils'

import '../../styles/chat.css'
import ChatMessages from './ChatMessages'
import { Chat, ChatFilters, LoadingState } from './types'
import { useChatContext } from '@/contexts/ChatContext'
import StartChat from './StartChat'

const ChatComponent: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [defaultModelName, setDefaultLLMName] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined)
  const { saveChat: updateChat, currentOpenChatID, setCurrentOpenChatID } = useChatContext()

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

  const handleSubmitNewMessage = useCallback(
    async (userTextFieldInput: string, chatFilters?: ChatFilters) => {
      if (!userTextFieldInput?.trim()) return
      try {
        const defaultLLMName = await window.llm.getDefaultLLMName()
        let outputChat = await prepareOutputChat(currentChat, userTextFieldInput, chatFilters)

        setCurrentChat(outputChat)
        setCurrentOpenChatID(outputChat.id)
        await updateChat(outputChat)

        const client = await resolveLLMClient(defaultLLMName)

        const { textStream } = await streamText({
          model: client,
          messages: outputChat.messages,
          tools: outputChat.tools,
          onFinish: (event) => {
            console.log('tool results', event.toolResults)
          },
        })

        // eslint-disable-next-line no-restricted-syntax
        for await (const text of textStream) {
          outputChat = {
            ...outputChat,
            messages: appendTextContentToMessages(outputChat.messages || [], text),
          }
          setCurrentChat(outputChat)
          setLoadingState('generating')
        }

        console.log('current chat to save:', outputChat)
        await updateChat(outputChat)

        setLoadingState('idle')
        posthog.capture('chat_message_submitted', {
          chatId: outputChat?.id,
          chatLength: outputChat?.messages.length,
          chatFilters: anonymizeChatFiltersForPosthog(chatFilters),
        })
      } catch (error) {
        setLoadingState('idle')
        throw error
      }
    },
    [setCurrentOpenChatID, updateChat, currentChat],
  )

  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-dark-gray-c-eleven">
        {currentChat && currentChat.messages && currentChat.messages.length > 0 ? (
          <ChatMessages
            currentChat={currentChat}
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
