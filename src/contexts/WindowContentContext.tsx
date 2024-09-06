import React, { createContext, useContext, useEffect, useMemo, ReactNode, useState } from 'react'

import { UNINITIALIZED_STATE, useChatContext } from './ChatContext'
import { useFileContext } from './FileContext'
import { ContextMenuFocus, ContextMenuLocations, ShowContextMenuInputType } from '@/components/Menu/CustomContextMenu'

interface WindowContentContextType {
  openContent: (pathOrChatID: string, optionalContentToWriteOnCreate?: string) => void
  focusedItem: ContextMenuFocus
  showContextMenu: ShowContextMenuInputType
  hideFocusedItem: () => void
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
  const [focusedItem, setFocusedItem] = useState<ContextMenuFocus>({
    currentSelection: 'None',
    locations: { x: 0, y: 0 },
  })

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

  const showContextMenu: ShowContextMenuInputType = React.useCallback(
    (
      event: React.MouseEvent<HTMLDivElement>,
      locationOnScreen: ContextMenuLocations,
      additionalData: Partial<Omit<ContextMenuFocus, 'currentSelection' | 'locations'>> = {},
    ) => {
      event.preventDefault()

      setFocusedItem({
        currentSelection: locationOnScreen,
        locations: { x: event.clientX, y: event.clientY },
        ...additionalData,
      })
    },
    [setFocusedItem],
  )

  const hideFocusedItem = React.useCallback(() => {
    setFocusedItem((prevItem: ContextMenuFocus) => ({
      currentSelection: 'None',
      locations: { x: 0, y: 0 },
      file: prevItem.file,
      chatMetadata: prevItem.chatMetadata,
    }))
  }, [setFocusedItem])

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
      focusedItem,
      showContextMenu,
      hideFocusedItem,
    }),
    [openContent, focusedItem, showContextMenu, hideFocusedItem],
  )

  return <WindowContentContext.Provider value={WindowContentContextMemo}>{children}</WindowContentContext.Provider>
}
