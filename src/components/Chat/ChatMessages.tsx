import React, { useState, useRef, useEffect, useCallback } from 'react'
import '../../styles/chat.css'
import { Spinner, YStack, ScrollView } from 'tamagui'
import { Chat, AgentConfig, LoadingState, ReorChatMessage } from '../../lib/llm/types'
import ChatInput from './ChatInput'
import UserMessage from './MessageComponents/UserMessage'
import AssistantMessage from './MessageComponents/AssistantMessage'
import SystemMessage from './MessageComponents/SystemMessage'
import ChatSources from './MessageComponents/ChatSources'
import useLLMConfigs from '@/lib/hooks/use-llm-configs'
import useAgentConfig from '@/lib/hooks/use-agent-configs'
import { useChatContext } from '@/contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'

interface MessageProps {
  message: ReorChatMessage
  index: number
  currentChat: Chat
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
}

const Message: React.FC<MessageProps> = ({ message, index, currentChat, setCurrentChat }) => {
  return (
    <>
      {!message.hideMessage && (
        <>
          {message.role === 'user' && <UserMessage key={`user-${index}`} message={message} />}
          {message.role === 'assistant' && (
            <AssistantMessage
              key={`assistant-${index}`}
              message={message}
              setCurrentChat={setCurrentChat}
              currentChat={currentChat}
            />
          )}
          {message.role === 'system' && <SystemMessage key={`system-${index}`} message={message} />}
        </>
      )}
      {message.context && <ChatSources key={`context-${index}`} contextItems={message.context} />}
    </>
  )
}

interface ChatMessagesProps {
  currentChat: Chat | undefined
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
  loadingState: LoadingState
  handleNewChatMessage: (llmName: string, userTextFieldInput?: string, agentConfig?: AgentConfig) => void
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  currentChat,
  setCurrentChat,
  handleNewChatMessage,
  loadingState,
}) => {
  const { agentConfig, setAgentConfig } = useAgentConfig()
  const [userTextFieldInput, setUserTextFieldInput] = useState<string | undefined>()
  const { defaultLLM, setDefaultLLM } = useLLMConfigs()
  const [selectedLLM, setSelectedLLM] = useState<string>()
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const { showEditor } = useContentContext()
  const { activePanel } = useChatContext()

  useEffect(() => {
    setSelectedLLM(defaultLLM)
  }, [defaultLLM])

  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight
    }
  }, [])

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom()
    }
  }, [currentChat?.messages, loadingState, shouldAutoScroll, scrollToBottom])

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
      const isScrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 1
      setShouldAutoScroll(isScrolledToBottom)
    }
  }

  const handleSubmitNewMessage = async () => {
    if (userTextFieldInput) {
      if (!selectedLLM) {
        throw new Error('Select an LLM.')
      }
      setDefaultLLM(selectedLLM)
      handleNewChatMessage(selectedLLM, userTextFieldInput, agentConfig)
      setUserTextFieldInput('')
      setShouldAutoScroll(true)
    }
  }

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (shouldAutoScroll) {
        scrollToBottom()
      }
    })

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current, { childList: true, subtree: true, characterData: true })
    }

    return () => observer.disconnect()
  }, [shouldAutoScroll, scrollToBottom])

  return (
    <YStack 
      flex={1}
      backgroundColor={activePanel && showEditor ? ( '$gray3' ) : ( '$background' )}
    >
      <div className="grow overflow-auto" ref={chatContainerRef} onScroll={handleScroll}>
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="w-full max-w-3xl">
            {currentChat &&
              currentChat.messages &&
              currentChat.messages.length > 0 &&
              currentChat.messages.map((message, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <div key={index} ref={index === currentChat.messages.length - 1 ? lastMessageRef : null}>
                  <Message message={message} index={index} currentChat={currentChat} setCurrentChat={setCurrentChat} />
                </div>
              ))}
          </div>

          {loadingState === 'waiting-for-first-token' && (
            <div className="mt-4 flex w-full max-w-3xl items-start gap-6 p-2">
              <YStack padding="$3" space="$4" alignItems="center">
                {/* @ts-expect-error */}
                <Spinner size="small" color="$blue9" />
              </YStack>
            </div>
          )}
        </div>
      </div>

      <YStack 
        width="100%"
        padding="$4"
      >
        <ChatInput
          userTextFieldInput={userTextFieldInput ?? ''}
          setUserTextFieldInput={setUserTextFieldInput}
          handleSubmitNewMessage={handleSubmitNewMessage}
          loadingState={loadingState}
          selectedLLM={selectedLLM}
          setSelectedLLM={setSelectedLLM}
          agentConfig={agentConfig}
          setAgentConfig={setAgentConfig}
        />
      </YStack>
    </YStack>
  )
}

export default ChatMessages
