import React, { useCallback, useEffect, useState, useRef } from 'react'

import { streamText } from 'ai'
import {
  appendToolCallsAndAutoExecuteTools,
  appendStringContentToMessages,
  appendToOrCreateChat,
  removeUncalledToolsFromMessages,
} from './utils'

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
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const fetchDefaultLLM = async () => {
      const defaultName = await window.llm.getDefaultLLMName()
      setDefaultLLMName(defaultName)
    }
    fetchDefaultLLM()
  }, [])

  useEffect(() => {
    const fetchChat = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

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

        abortControllerRef.current = new AbortController()

        const { textStream, toolCalls } = await streamText({
          model: llmClient,
          messages: removeUncalledToolsFromMessages(outputChat.messages),
          tools: Object.assign({}, ...outputChat.toolDefinitions.map(convertToolConfigToZodSchema)),
          abortSignal: abortControllerRef.current.signal,
        })

        // eslint-disable-next-line no-restricted-syntax
        for await (const text of textStream) {
          if (abortControllerRef.current.signal.aborted) {
            return
          }

          outputChat = {
            ...outputChat,
            messages: appendStringContentToMessages(outputChat.messages || [], text),
          }
          setCurrentChat(outputChat)
          setLoadingState('generating')
        }

        if (!abortControllerRef.current.signal.aborted) {
          outputChat.messages = await appendToolCallsAndAutoExecuteTools(
            outputChat.messages,
            outputChat.toolDefinitions,
            await toolCalls,
          )
          setCurrentChat(outputChat)
          await saveChat(outputChat)
        }

        setLoadingState('idle')
      } catch (error) {
        setLoadingState('idle')
        throw error
      } finally {
        abortControllerRef.current = null
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
