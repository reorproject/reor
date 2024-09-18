import React, { useCallback, useEffect, useState } from 'react'

import { streamText } from 'ai'
import { appendToOrCreateChat, appendTextContentToMessages, removeUncalledToolsFromMessages } from './utils'

import '../../styles/chat.css'
import ChatMessages from './ChatMessages'
import { Chat, AgentConfig, LoadingState } from './types'
import { useChatContext } from '@/contexts/ChatContext'
import StartChat from './StartChat'
import { convertToolConfigToZodSchema } from './tools'
import resolveLLMClient from '@/utils/llm'

const ChatComponent: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [defaultModelName, setDefaultLLMName] = useState<string>('')
  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined)
  const { saveChat, currentOpenChatID, setCurrentOpenChatID } = useChatContext()

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
      setCurrentChat((oldChat) => {
        if (oldChat) {
          saveChat(oldChat)
        }
        return chat
      })
      setLoadingState('idle')
    }
    fetchChat()
  }, [currentOpenChatID, saveChat])

  const handleNewChatMessage = useCallback(
    async (userTextFieldInput?: string, chatFilters?: AgentConfig) => {
      try {
        const defaultLLMName = await window.llm.getDefaultLLMName()

        if (!userTextFieldInput?.trim() && (!currentChat || currentChat.messages.length === 0)) {
          return
        }

        let outputChat = userTextFieldInput?.trim()
          ? await appendToOrCreateChat(currentChat, userTextFieldInput, chatFilters)
          : currentChat

        if (!outputChat) {
          return
        }

        setCurrentChat(outputChat)
        setCurrentOpenChatID(outputChat.id)
        await saveChat(outputChat)

        const llmClient = await resolveLLMClient(defaultLLMName)

        const { textStream, toolCalls } = await streamText({
          model: llmClient,
          messages: removeUncalledToolsFromMessages(outputChat.messages),
          tools: Object.assign({}, ...outputChat.toolDefinitions.map(convertToolConfigToZodSchema)),
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
        outputChat.messages = appendTextContentToMessages(outputChat.messages, await toolCalls)
        setCurrentChat(outputChat)
        await saveChat(outputChat)

        setLoadingState('idle')
      } catch (error) {
        setLoadingState('idle')
        throw error
      }
    },
    [setCurrentOpenChatID, saveChat, currentChat],
  )

  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-background">
        {currentChat && currentChat.messages && currentChat.messages.length > 0 ? (
          <ChatMessages
            currentChat={currentChat}
            setCurrentChat={setCurrentChat}
            loadingState={loadingState}
            handleNewChatMessage={handleNewChatMessage}
          />
        ) : (
          <StartChat defaultModelName={defaultModelName} handleNewChatMessage={handleNewChatMessage} />
        )}
      </div>
    </div>
  )
}

export default ChatComponent
