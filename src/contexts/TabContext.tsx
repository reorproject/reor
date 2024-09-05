import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react'

import { UNINITIALIZED_STATE, useChatContext } from './ChatContext'
import { useFileContext } from './FileContext'

interface TabContextType {
  openTabContent: (pathOrChatID: string, optionalContentToWriteOnCreate?: string) => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

export const useTabsContext = (): TabContextType => {
  const context = useContext(TabContext)
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabProvider')
  }
  return context
}

interface TabContentProviderProps {
  children: ReactNode
}

export const WindowContentProvider: React.FC<TabContentProviderProps> = ({ children }) => {
  const { currentOpenChat, setCurrentOpenChat, allChatsMetadata, setShowChatbot, setSidebarShowing } = useChatContext()
  const { currentlyOpenFilePath, openOrCreateFile } = useFileContext()

  const filePathRef = React.useRef<string>('')
  const chatIDRef = React.useRef<string>('')

  const openTabContent = React.useCallback(
    async (pathOrChatID: string, optionalContentToWriteOnCreate?: string) => {
      if (!pathOrChatID) return
      const chatMetadata = allChatsMetadata.find((chat) => chat.id === pathOrChatID)
      if (chatMetadata) {
        const chatID = chatMetadata.id
        if (chatID === UNINITIALIZED_STATE) return
        const chat = await window.electronStore.getChat(chatID)
        setShowChatbot(true)
        setCurrentOpenChat(chat)
      } else {
        setShowChatbot(false)
        setSidebarShowing('files')
        openOrCreateFile(pathOrChatID, optionalContentToWriteOnCreate)
      }
    },
    [allChatsMetadata, setShowChatbot, setCurrentOpenChat, setSidebarShowing, openOrCreateFile],
  )

  // useEffect(() => {
  //   const fetchHistoryTabs = async () => {
  //     const response: Tab[] = await window.electronStore.getCurrentOpenTabs()
  //     setOpenTabs(response)
  //   }

  //   fetchHistoryTabs()
  // }, [])

  useEffect(() => {
    if (currentlyOpenFilePath != null && filePathRef.current !== currentlyOpenFilePath) {
      filePathRef.current = currentlyOpenFilePath
    }

    const currentChatHistoryId = currentOpenChat?.id ?? ''
    if (chatIDRef.current !== currentChatHistoryId) {
      chatIDRef.current = currentChatHistoryId
    }
  }, [currentOpenChat, allChatsMetadata, currentlyOpenFilePath])

  const TabContextMemo = useMemo(
    () => ({
      openTabContent,
    }),
    [openTabContent],
  )

  return <TabContext.Provider value={TabContextMemo}>{children}</TabContext.Provider>
}
