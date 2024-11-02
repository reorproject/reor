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
import useResizeObserver from '@/lib/hooks/use-resize-observer'

const ChatComponent: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [defaultModelName, setDefaultLLMName] = useState<string>('')
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentChat, setCurrentChat, saveChat } = useChatContext()
  const abortControllerRef = useRef<AbortController | null>(null)

  useResizeObserver(containerRef, (entry) => {
    setContainerWidth(entry.contentRect.width)
  })

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
      setLoadingState('idle')
    }
    fetchChat()
  }, [currentChat?.id, saveChat])

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
        await saveChat(outputChat)

        const llmClient = await resolveLLMClient(defaultLLMName)
        abortControllerRef.current = new AbortController()
        const toolsZodSchema = Object.assign({}, ...outputChat.toolDefinitions.map(convertToolConfigToZodSchema))
        setLoadingState('waiting-for-first-token')
        const { textStream, toolCalls } = await streamText({
          model: llmClient,
          messages: removeUncalledToolsFromMessages(outputChat.messages),
          tools: toolsZodSchema,
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
              <div>
                This model does not support tool calling. To use tool calling, please download a model from this page:{' '}
                <a href="https://ollama.com/search?c=tools" target="_blank" rel="noopener noreferrer">
                  https://ollama.com/search?c=tools
                </a>{' '}
                or use a cloud LLM like GPT-4o or Claude.
              </div>,
              {
                autoClose: false,
                closeOnClick: false,
              },
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
    [saveChat, setCurrentChat],
  )

  // eslint-disable-next-line react/no-unstable-nested-components
  const CompactChatStart: React.FC = () => (
    <div className="flex size-full flex-col items-center justify-center p-4">
      <h3 className="text-lg font-medium">Chat Assistant</h3>
      <p className="text-sm text-muted-foreground">Please expand the panel to start a new chat</p>
    </div>
  )

  return (
    <div ref={containerRef} className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden bg-background">
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
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {containerWidth > 400 ? (
              <StartChat
                defaultModelName={defaultModelName}
                handleNewChatMessage={(userTextFieldInput?: string, agentConfig?: AgentConfig) =>
                  handleNewChatMessage(undefined, userTextFieldInput, agentConfig)
                }
              />
            ) : (
              <CompactChatStart />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatComponent
