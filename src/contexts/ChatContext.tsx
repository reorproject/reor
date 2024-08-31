import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ChatHistoryMetadata, useChatHistory } from '@/components/Chat/hooks/use-chat-history'
import { Chat, ChatFilters } from '@/components/Chat/types'
import { SidebarAbleToShow } from '@/components/Sidebars/MainSidebar'

export const UNINITIALIZED_STATE = 'UNINITIALIZED_STATE'

interface ChatContextType {
  // openTabContent: (path: string, optionalContentToWriteOnCreate?: string) => void
  // currentTab: string
  sidebarShowing: SidebarAbleToShow
  setSidebarShowing: (option: SidebarAbleToShow) => void
  getChatIdFromPath: (path: string) => string
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
  // const [currentTab, setCurrentTab] = useState<string>('')
  const [chatFilters, setChatFilters] = useState<ChatFilters>({
    files: [],
    numberOfChunksToFetch: 15,
    minDate: new Date(0),
    maxDate: new Date(),
  })
  const [sidebarShowing, setSidebarShowing] = useState<SidebarAbleToShow>('files')

  const { currentChatHistory, setCurrentChatHistory, chatHistoriesMetadata } = useChatHistory()

  // const filePathRef = React.useRef<string>('')
  // const chatIDRef = React.useRef<string>('')

  const openChatSidebarAndChat = useCallback(
    (chatHistory: Chat | undefined) => {
      setShowChatbot(true)
      setCurrentChatHistory(chatHistory)
    },
    [setCurrentChatHistory],
  )

  const getChatIdFromPath = useCallback(
    (path: string) => {
      if (chatHistoriesMetadata.length === 0) return UNINITIALIZED_STATE
      const metadata = chatHistoriesMetadata.find((chat) => chat.displayName === path)
      if (metadata) return metadata.id
      return ''
    },
    [chatHistoriesMetadata],
  )

  // useEffect(() => {
  //   if (currentlyOpenFilePath != null && filePathRef.current !== currentlyOpenFilePath) {
  //     filePathRef.current = currentlyOpenFilePath
  //     setCurrentTab(currentlyOpenFilePath)
  //   }

  //   const currentChatHistoryId = currentChatHistory?.id ?? ''
  //   if (chatIDRef.current !== currentChatHistoryId) {
  //     chatIDRef.current = currentChatHistoryId
  //     const currentMetadata = chatHistoriesMetadata.find((chat) => chat.id === currentChatHistoryId)
  //     if (currentMetadata) {
  //       setCurrentTab(currentMetadata.displayName)
  //     }
  //   }
  // }, [currentChatHistory, chatHistoriesMetadata, currentlyOpenFilePath])

  useEffect(() => {
    const handleAddFileToChatFilters = (file: string) => {
      setSidebarShowing('chats')
      setShowChatbot(true)
      setCurrentChatHistory(undefined)
      setChatFilters((prevChatFilters) => ({
        ...prevChatFilters,
        files: [...prevChatFilters.files, file],
      }))
    }
    const removeAddChatToFileListener = window.ipcRenderer.receive('add-file-to-chat-listener', (noteName: string) => {
      handleAddFileToChatFilters(noteName)
    })

    return () => {
      removeAddChatToFileListener()
    }
  }, [setCurrentChatHistory, setChatFilters, setShowChatbot])

  // const openTabContent = React.useCallback(
  //   async (path: string, optionalContentToWriteOnCreate?: string) => {
  //     if (!path) return
  //     const chatID = getChatIdFromPath(path)
  //     if (chatID) {
  //       if (chatID === UNINITIALIZED_STATE) return
  //       const chat = await window.electronStore.getChatHistory(chatID)
  //       openChatSidebarAndChat(chat)
  //     } else {
  //       setShowChatbot(false)
  //       setSidebarShowing('files')
  //       openOrCreateFile(path, optionalContentToWriteOnCreate)
  //     }
  //     setCurrentTab(path)
  //   },
  //   [getChatIdFromPath, openChatSidebarAndChat, setShowChatbot, setSidebarShowing, openOrCreateFile, setCurrentTab],
  // )

  const value = React.useMemo(
    () => ({
      // openTabContent,
      // currentTab,
      sidebarShowing,
      setSidebarShowing,
      getChatIdFromPath,
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
      // openTabContent,
      // currentTab,
      sidebarShowing,
      setSidebarShowing,
      getChatIdFromPath,
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
