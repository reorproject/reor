import React, { useCallback, useEffect, useState, useRef } from 'react'

import { streamText } from 'ai'
import { toast } from 'react-toastify'
import {
  appendStringContentToMessages,
  appendToOrCreateChat as updateOrCreateChat,
  removeUncalledToolsFromMessages,
} from '../../lib/llm/chat'

import '../../styles/chat.css'
import ChatMessages from './ChatMessages'
import { Chat, AgentConfig, LoadingState } from '../../lib/llm/types'
import { useChatContext } from '@/contexts/ChatContext'
import StartChat from './StartChat'
import resolveLLMClient from '@/lib/llm/client'
import { appendToolCallsAndAutoExecuteTools, convertToolConfigToZodSchema } from '../../lib/llm/tools/utils'

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
        if (oldChat && oldChat.id !== currentOpenChatID) {
          saveChat(oldChat)
        }
        return chat
      })
      setLoadingState('idle')
    }
    fetchChat()
  }, [currentOpenChatID, saveChat])

  const handleNewChatMessage = useCallback(
    async (chat: Chat | undefined, userTextFieldInput?: string, agentConfig?: AgentConfig) => {
      let outputChat: Chat | undefined
      try {
        const defaultLLMName = await window.llm.getDefaultLLMName()
        if (!userTextFieldInput?.trim() && (!chat || chat.messages.length === 0)) {
          return
        }

        outputChat = userTextFieldInput?.trim() ? await updateOrCreateChat(chat, userTextFieldInput, agentConfig) : chat

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
          if (agentConfig) {
            window.electronStore.setAgentConfig(agentConfig)
          }

          const { messages: outputMessages, allToolCallsHaveBeenExecuted } = await appendToolCallsAndAutoExecuteTools(
            outputChat.messages,
            outputChat.toolDefinitions,
            await toolCalls,
          )
          outputChat.messages = outputMessages
          setCurrentChat(outputChat)
          await saveChat(outputChat)
          if (allToolCallsHaveBeenExecuted) {
            handleNewChatMessage(outputChat, undefined, agentConfig)
          }
        }

        setLoadingState('idle')
      } catch (error) {
        if (error instanceof Error && error.name === 'AI_APICallError' && error.message.includes('Bad Request')) {
          if (agentConfig && agentConfig?.toolDefinitions.length > 0 && outputChat) {
            toast.info(
              'Disabling tools as this model does not support them. If you want to use tools, please select a different model. If you want to retrieve from your knowledge base, select "make initial search" option.',
            )
            const agentWithoutTools = { ...agentConfig, toolDefinitions: [] }
            outputChat.toolDefinitions = []
            handleNewChatMessage(outputChat, undefined, agentWithoutTools)
            return
          }
        }
        // so here we could check the error message
        setLoadingState('idle')
        throw error
      } finally {
        abortControllerRef.current = null
      }
    },
    [setCurrentOpenChatID, saveChat],
  )

  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden  bg-background">
        {currentChat && currentChat.messages && currentChat.messages.length > 0 ? (
          <ChatMessages
            currentChat={currentChat}
            setCurrentChat={setCurrentChat}
            loadingState={loadingState}
            handleNewChatMessage={(userTextFieldInput?: string, chatFilters?: AgentConfig) =>
              handleNewChatMessage(currentChat, userTextFieldInput, chatFilters)
            }
          />
        ) : (
          <StartChat
            defaultModelName={defaultModelName}
            handleNewChatMessage={(userTextFieldInput?: string, agentConfig?: AgentConfig) =>
              handleNewChatMessage(undefined, userTextFieldInput, agentConfig)
            }
          />
        )}
      </div>
    </div>
  )
}

export default ChatComponent
