import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Chat } from '@/components/Chat/types'
import { SidebarAbleToShow } from '@/components/Sidebars/MainSidebar'
import { getDisplayableChatName } from '@/components/Chat/utils'

export const UNINITIALIZED_STATE = 'UNINITIALIZED_STATE'
export interface ChatMetadata {
  id: string
  displayName: string
}

interface ChatContextType {
  sidebarShowing: SidebarAbleToShow
  setSidebarShowing: (option: SidebarAbleToShow) => void
  getChatIdFromPath: (path: string) => string
  showChatbot: boolean
  setShowChatbot: (show: boolean) => void
  currentOpenChat: Chat | undefined
  setCurrentOpenChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
  allChatsMetadata: ChatMetadata[]
  openChatSidebarAndChat: (chat: Chat | undefined) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showChatbot, setShowChatbot] = useState<boolean>(false)
  const [sidebarShowing, setSidebarShowing] = useState<SidebarAbleToShow>('files')

  const [currentOpenChat, setCurrentOpenChat] = useState<Chat>()
  const [allChatsMetadata, setAllChatsMetadata] = useState<ChatMetadata[]>([])

  const fetchChatHistories = async () => {
    let allChats = await window.electronStore.getAllChats()
    if (!allChats) {
      allChats = []
    }
    setAllChatsMetadata(
      allChats.map((chat) => ({
        id: chat.id,
        displayName: getDisplayableChatName(chat),
      })),
    )

    setCurrentOpenChat(undefined)
  }

  useEffect(() => {
    const updateChatHistoriesMetadata = window.ipcRenderer.receive(
      'update-chat-histories',
      (retrievedChatHistoriesMetadata: Chat[]) => {
        setAllChatsMetadata(
          retrievedChatHistoriesMetadata.map((chat: Chat) => ({
            id: chat.id,
            displayName: getDisplayableChatName(chat),
          })),
        )
      },
    )

    return () => {
      updateChatHistoriesMetadata()
    }
  }, [])

  useEffect(() => {
    fetchChatHistories()
  }, [])

  const openChatSidebarAndChat = useCallback(
    (chat: Chat | undefined) => {
      setShowChatbot(true)
      setCurrentOpenChat(chat)
    },
    [setCurrentOpenChat],
  )

  const getChatIdFromPath = useCallback(
    (path: string) => {
      if (allChatsMetadata.length === 0) return UNINITIALIZED_STATE
      const metadata = allChatsMetadata.find((chat) => chat.displayName === path)
      if (metadata) return metadata.id
      return ''
    },
    [allChatsMetadata],
  )

  useEffect(() => {
    const handleAddFileToChatFilters = () => {
      // setSidebarShowing('chats')
      // setShowChatbot(true)
      // setCurrentChatHistory(undefined)
      // setChatFilters((prevChatFilters) => ({
      //   ...prevChatFilters,
      //   files: [...prevChatFilters.files, file],
      // }))
      // TODO: CALL START CONVERSATION FUNCTION
    }
    const removeAddChatToFileListener = window.ipcRenderer.receive('add-file-to-chat-listener', () => {
      handleAddFileToChatFilters()
    })

    return () => {
      removeAddChatToFileListener()
    }
  }, [])

  const value = React.useMemo(
    () => ({
      currentOpenChat,
      setCurrentOpenChat,
      allChatsMetadata,
      sidebarShowing,
      setSidebarShowing,
      getChatIdFromPath,
      showChatbot,
      setShowChatbot,
      openChatSidebarAndChat,
    }),
    [
      allChatsMetadata,
      sidebarShowing,
      setSidebarShowing,
      getChatIdFromPath,
      showChatbot,
      setShowChatbot,
      currentOpenChat,
      setCurrentOpenChat,
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
