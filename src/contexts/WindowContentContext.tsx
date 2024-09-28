import React, { createContext, useContext, useMemo, ReactNode, useState } from 'react'

import { useChatContext } from './ChatContext'
import { useFileContext } from './FileContext'
import { OnShowContextMenuData, ShowContextMenuInputType } from '@/components/Common/CustomContextMenu'

interface WindowContentContextType {
  openContent: (pathOrChatID: string, optionalContentToWriteOnCreate?: string, dontUpdateChatHistory?: boolean) => void
  focusedItem: OnShowContextMenuData
  showContextMenu: ShowContextMenuInputType
  hideFocusedItem: () => void
  currentOpenFileOrChatID: string | null
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
  const [focusedItem, setFocusedItem] = useState<OnShowContextMenuData>({
    currentSelection: 'None',
    position: { x: 0, y: 0 },
  })
  const [currentOpenFileOrChatID, setCurrentOpenFileOrChatID] = useState<string | null>(null)

  const { setCurrentOpenChatID, allChatsMetadata, setShowChatbot, setSidebarShowing } = useChatContext()
  const { openOrCreateFile, addToNavigationHistory } = useFileContext()

  const openContent = React.useCallback(
    async (pathOrChatID: string, optionalContentToWriteOnCreate?: string, dontUpdateChatHistory?: boolean) => {
      if (!pathOrChatID) return
      const chatMetadata = allChatsMetadata.find((chat) => chat.id === pathOrChatID)
      if (chatMetadata) {
        setShowChatbot(true)
        setCurrentOpenChatID(pathOrChatID)
      } else {
        setShowChatbot(false)
        setSidebarShowing('files')
        openOrCreateFile(pathOrChatID, optionalContentToWriteOnCreate)
      }
      setCurrentOpenFileOrChatID(pathOrChatID)
      if (!dontUpdateChatHistory) {
        addToNavigationHistory(pathOrChatID)
      }
    },
    [
      allChatsMetadata,
      setShowChatbot,
      setCurrentOpenChatID,
      setSidebarShowing,
      openOrCreateFile,
      addToNavigationHistory,
      setCurrentOpenFileOrChatID,
    ],
  )
  const showContextMenu: ShowContextMenuInputType = React.useCallback(
    (event, locationOnScreen, additionalData = {}) => {
      event.preventDefault()
      setFocusedItem({
        currentSelection: locationOnScreen,
        position: { x: event.clientX, y: event.clientY },
        ...additionalData,
      })
    },
    [setFocusedItem],
  )

  const hideFocusedItem = React.useCallback(() => {
    setFocusedItem((prevItem: OnShowContextMenuData) => ({
      currentSelection: 'None',
      position: { x: 0, y: 0 },
      file: prevItem.file,
      chatMetadata: prevItem.chatMetadata,
    }))
  }, [setFocusedItem])

  const WindowContentContextMemo = useMemo(
    () => ({
      openContent,
      focusedItem,
      showContextMenu,
      hideFocusedItem,
      currentOpenFileOrChatID,
    }),
    [openContent, focusedItem, showContextMenu, hideFocusedItem, currentOpenFileOrChatID],
  )

  return <WindowContentContext.Provider value={WindowContentContextMemo}>{children}</WindowContentContext.Provider>
}
