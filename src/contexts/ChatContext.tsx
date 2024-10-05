import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { SidebarAbleToShow } from '@/components/Sidebars/MainSidebar'
import { Chat, ChatMetadata } from '@/lib/llm/types'

export const UNINITIALIZED_STATE = 'UNINITIALIZED_STATE'

interface ChatContextType {
  sidebarShowing: SidebarAbleToShow
  setSidebarShowing: (option: SidebarAbleToShow) => void
  showChatbot: boolean
  setShowChatbot: (show: boolean) => void
  currentOpenChatID: string | undefined
  setCurrentOpenChatID: (chatID: string | undefined) => void
  allChatsMetadata: ChatMetadata[]
  deleteChat: (chatID: string | undefined) => Promise<boolean>
  saveChat: (updatedChat: Chat) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false)
  const [sidebarShowing, setSidebarShowing] = useState<SidebarAbleToShow>('files')
  const [currentOpenChatID, setCurrentOpenChatID] = useState<string | undefined>(undefined)
  const [allChatsMetadata, setAllChatsMetadata] = useState<ChatMetadata[]>([])

  useEffect(() => {
    const fetchChatHistories = async () => {
      const allChatsMetadataResponse = await window.electronStore.getAllChatsMetadata()
      setAllChatsMetadata(allChatsMetadataResponse)
    }
    fetchChatHistories()
  }, [])

  const saveChat = useCallback(async (updatedChat: Chat) => {
    await window.electronStore.saveChat(updatedChat)

    const retrievedChatsMetadata = await window.electronStore.getAllChatsMetadata()
    setAllChatsMetadata(retrievedChatsMetadata)
  }, [])

  const deleteChat = useCallback(
    async (chatID: string | undefined) => {
      if (!chatID) return false
      await window.electronStore.deleteChat(chatID)
      const retrievedChatsMetadata = await window.electronStore.getAllChatsMetadata()
      setAllChatsMetadata(retrievedChatsMetadata)
      if (currentOpenChatID === chatID) {
        setCurrentOpenChatID(undefined)
      }
      return true
    },
    [currentOpenChatID],
  )

  const value = React.useMemo(
    () => ({
      allChatsMetadata,
      sidebarShowing,
      setSidebarShowing,
      showChatbot,
      setShowChatbot,
      currentOpenChatID,
      setCurrentOpenChatID,
      deleteChat,
      saveChat,
    }),
    [
      allChatsMetadata,
      sidebarShowing,
      setSidebarShowing,
      showChatbot,
      setShowChatbot,
      currentOpenChatID,
      setCurrentOpenChatID,
      deleteChat,
      saveChat,
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
