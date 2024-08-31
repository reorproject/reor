import React, { createContext, useContext, useState, useCallback } from 'react'
import { ChatHistoryMetadata, useChatHistory } from '@/components/Chat/hooks/use-chat-history'
import { Chat, ChatFilters } from '@/components/Chat/types'

interface ChatContextType {
  showChatbot: boolean
  setShowChatbot: (show: boolean) => void
  currentChatHistory: Chat | undefined
  setCurrentChatHistory: React.Dispatch<React.SetStateAction<Chat | undefined>>
  chatHistoriesMetadata: ChatHistoryMetadata[]
  chatFilters: ChatFilters
  setChatFilters: React.Dispatch<React.SetStateAction<ChatFilters>>
  openChatSidebarAndChat: (chatHistory: Chat | undefined) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false)
  const [chatFilters, setChatFilters] = useState<ChatFilters>({
    files: [],
    numberOfChunksToFetch: 15,
    minDate: new Date(0),
    maxDate: new Date(),
  })

  const { currentChatHistory, setCurrentChatHistory, chatHistoriesMetadata } = useChatHistory()

  const openChatSidebarAndChat = useCallback(
    (chatHistory: Chat | undefined) => {
      setShowChatbot(true)
      setCurrentChatHistory(chatHistory)
    },
    [setCurrentChatHistory],
  )

  const value = React.useMemo(
    () => ({
      showChatbot,
      setShowChatbot,
      currentChatHistory,
      setCurrentChatHistory,
      chatHistoriesMetadata,
      chatFilters,
      setChatFilters,
      openChatSidebarAndChat,
    }),
    [
      showChatbot,
      setShowChatbot,
      currentChatHistory,
      setCurrentChatHistory,
      chatHistoriesMetadata,
      chatFilters,
      setChatFilters,
      openChatSidebarAndChat,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
