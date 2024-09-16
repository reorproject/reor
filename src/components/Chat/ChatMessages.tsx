import React, { useState } from 'react'
import '../../styles/chat.css'
import { Chat, ChatFilters, LoadingState, ReorChatMessage } from './types'
import ChatInput from './ChatInput'
import LoadingDots from '@/utils/animations'
import UserMessage from './MessageComponents/UserMessage'
import AssistantMessage from './MessageComponents/AssistantMessage'
import SystemMessage from './MessageComponents/SystemMessage'
import InChatContextComponent from './MessageComponents/InChatContext'

interface ChatMessagesProps {
  currentChat: Chat
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
  loadingState: LoadingState
  handleNewChatMessage: (userTextFieldInput?: string, chatFilters?: ChatFilters) => void
}

interface MessageProps {
  message: ReorChatMessage
  index: number
  currentChat: Chat
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
  handleNewChatMessage: (userTextFieldInput?: string, chatFilters?: ChatFilters) => void
}

const Message: React.FC<MessageProps> = ({ message, index, currentChat, setCurrentChat, handleNewChatMessage }) => {
  return (
    <>
      {message.role === 'user' && <UserMessage key={index} message={message} />}
      {message.role === 'assistant' && (
        <AssistantMessage
          key={index}
          messageIndex={index}
          message={message}
          setCurrentChat={setCurrentChat}
          currentChat={currentChat}
          handleNewChatMessage={handleNewChatMessage}
        />
      )}
      {message.role === 'system' && <SystemMessage key={index} message={message} />}
      {message.context && <InChatContextComponent key={index} contextItems={message.context} />}
    </>
  )
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  currentChat,
  setCurrentChat,
  handleNewChatMessage,
  loadingState,
}) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string | undefined>()

  return (
    <div className="flex h-full flex-col">
      <div className="grow overflow-auto">
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="w-full max-w-3xl">
            {currentChat?.messages?.length > 0 &&
              currentChat.messages.map((message, index) => (
                <Message
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  message={message}
                  index={index}
                  currentChat={currentChat}
                  setCurrentChat={setCurrentChat}
                  handleNewChatMessage={handleNewChatMessage}
                />
              ))}
          </div>

          {loadingState === 'waiting-for-first-token' && (
            <div className="mt-4 flex w-full max-w-3xl items-start gap-6">
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
