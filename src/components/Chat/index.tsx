import React, { useCallback, useEffect, useState, useRef } from 'react'

import { streamText } from 'ai'
import { toast } from 'react-toastify'
import {
  appendStringContentToMessages,
  appendToOrCreateChat,
  removeUncalledToolsFromMessages,
} from '../../lib/llm/chat'

import '../../styles/chat.css'
import ChatMessages from './ChatMessages'
import { Chat, AgentConfig, LoadingState } from '../../lib/llm/types'
import { useChatContext } from '@/contexts/ChatContext'
import resolveLLMClient from '@/lib/llm/client'
import { appendToolCallsAndAutoExecuteTools, convertToolConfigToZodSchema } from '../../lib/llm/tools/utils'

const ChatComponent: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const containerRef = useRef<HTMLDivElement>(null)
  const { currentChat, setCurrentChat, saveChat } = useChatContext()
  const abortControllerRef = useRef<AbortController | null>(null)

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
    async (chat: Chat | undefined, llmName: string, userTextFieldInput?: string, agentConfig?: AgentConfig) => {
      let outputChat: Chat | undefined
      try {
        if (!userTextFieldInput?.trim() && (!chat || chat.messages.length === 0)) {
          return
        }

        outputChat = userTextFieldInput?.trim()
          ? await appendToOrCreateChat(chat, userTextFieldInput, agentConfig)
          : chat

        if (!outputChat) {
          return
        }

        setCurrentChat(outputChat)
        await saveChat(outputChat)

        const llmClient = await resolveLLMClient(llmName)
        abortControllerRef.current = new AbortController()
        const toolsZodSchema = Object.assign({}, ...outputChat.toolDefinitions.map(convertToolConfigToZodSchema))
        setLoadingState('waiting-for-first-token')
        const { textStream, toolCalls } = await streamText({
          model: llmClient,
          messages: removeUncalledToolsFromMessages(outputChat.messages),
          tools: toolsZodSchema,
          abortSignal: abortControllerRef.current.signal,
        })

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
            handleNewChatMessage(outputChat, llmName, undefined, agentConfig)
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
            handleNewChatMessage(outputChat, llmName, undefined, agentWithoutTools)
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

  return (
    <div ref={containerRef} className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden">
        <ChatMessages
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          loadingState={loadingState}
          handleNewChatMessage={(llmName: string, userTextFieldInput?: string, agentConfig?: AgentConfig) =>
            handleNewChatMessage(currentChat, llmName, userTextFieldInput, agentConfig)
          }
        />
      </div>
    </div>
  )
}

export default ChatComponent
