import React, { useState } from 'react'
import '../../styles/chat.css'
import { Chat, ChatFilters, LoadingState, ReorChatMessage } from './types'
import ChatInput from './ChatInput'
import LoadingDots from '@/utils/animations'
import UserMessage from './MessageComponents/UserMessage'
import AssistantMessage from './MessageComponents/AssistantMessage'
import SystemMessage from './MessageComponents/SystemMessage'

interface ChatMessagesProps {
  currentChat: Chat
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
  loadingState: LoadingState
  handleNewChatMessage: (userTextFieldInput?: string, chatFilters?: ChatFilters) => void
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  currentChat,
  setCurrentChat,
  handleNewChatMessage,
  loadingState,
}) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string | undefined>()

  const renderMessage = (message: ReorChatMessage, index: number) => {
    switch (message.role) {
      case 'user':
        return <UserMessage key={index} message={message} />
      case 'assistant':
        return (
          <AssistantMessage
            key={index}
            messageIndex={index}
            message={message}
            setCurrentChat={setCurrentChat}
            currentChat={currentChat}
            handleNewChatMessage={handleNewChatMessage}
          />
        )
      case 'system':
        return <SystemMessage key={index} message={message} />
      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="grow overflow-auto">
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="w-full max-w-3xl">
            {currentChat?.messages?.length > 0 &&
              currentChat.messages.map((message, index) => renderMessage(message, index))}
          </div>

          {loadingState === 'waiting-for-first-token' && (
            <div className="mt-4 flex w-full max-w-3xl items-start gap-6">
              <img src="icon.png" style={{ width: '22px', height: '22px' }} alt="ReorImage" />
              <LoadingDots />
            </div>
          )}
        </div>
      </div>

      {currentChat && (
        <div className="w-full p-4">
          <ChatInput
            userTextFieldInput={userTextFieldInput ?? ''}
            setUserTextFieldInput={setUserTextFieldInput}
            handleSubmitNewMessage={() => {
              if (userTextFieldInput) {
                handleNewChatMessage(userTextFieldInput)
                setUserTextFieldInput('')
              }
            }}
            loadingState={loadingState}
          />
        </div>
      )}
    </div>
  )
}

export default ChatMessages
