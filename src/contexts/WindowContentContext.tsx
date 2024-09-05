import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react'

import { UNINITIALIZED_STATE, useChatContext } from './ChatContext'
import { useFileContext } from './FileContext'

interface WindowContentContextType {
  openContent: (pathOrChatID: string, optionalContentToWriteOnCreate?: string) => void
}

const WindowContentContext = createContext<WindowContentContextType | undefined>(undefined)

export const useWindowContentContext = (): WindowContentContextType => {
  const context = useContext(WindowContentContext)
  if (context === undefined) {
    throw new Error('useWindowContent must be used within a WindowContentProvider')
  }
  return context
}

interface WindowContentProviderProps {
  children: ReactNode
}

export const WindowContentProvider: React.FC<WindowContentProviderProps> = ({ children }) => {
  const { currentOpenChat, setCurrentOpenChat, allChatsMetadata, setShowChatbot, setSidebarShowing } = useChatContext()
  const { currentlyOpenFilePath, openOrCreateFile } = useFileContext()

  const filePathRef = React.useRef<string>('')
  const chatIDRef = React.useRef<string>('')

  const openContent = React.useCallback(
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

  useEffect(() => {
    if (currentlyOpenFilePath != null && filePathRef.current !== currentlyOpenFilePath) {
      filePathRef.current = currentlyOpenFilePath
    }

    const currentChatHistoryId = currentOpenChat?.id ?? ''
    if (chatIDRef.current !== currentChatHistoryId) {
      chatIDRef.current = currentChatHistoryId
    }
  }, [currentOpenChat, allChatsMetadata, currentlyOpenFilePath])

  const WindowContentContextMemo = useMemo(
    () => ({
      openContent,
    }),
    [openContent],
  )

  return <WindowContentContext.Provider value={WindowContentContextMemo}>{children}</WindowContentContext.Provider>
}
