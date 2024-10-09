import React, { createContext, useContext, useMemo, ReactNode, useState, useCallback } from 'react'

import posthog from 'posthog-js'
import { useChatContext } from './ChatContext'
import { useFileContext } from './FileContext'
import { OnShowContextMenuData, ShowContextMenuInputType } from '@/components/Common/CustomContextMenu'

interface WindowContentContextType {
  openContent: (pathOrChatID: string, optionalContentToWriteOnCreate?: string, dontUpdateChatHistory?: boolean) => void
  focusedItem: OnShowContextMenuData
  showContextMenu: ShowContextMenuInputType
  hideFocusedItem: () => void
  currentOpenFileOrChatID: string | null
  createAndOpenNewNote: () => void
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
  const { openOrCreateFile, addToNavigationHistory, currentlyOpenFilePath } = useFileContext()

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

  const createAndOpenUntitledNote = useCallback(async () => {
    let fileName = 'Untitled'
    let index = 0
    let directoryName = ''

    if (currentlyOpenFilePath) {
      directoryName = await window.path.dirname(currentlyOpenFilePath)
      const files = await window.fileSystem.getAllFilenamesInDirectory(directoryName)
      while (files.includes(`${fileName}.md`)) {
        index += 1
        fileName = `Untitled ${index}`
      }
    }

    const finalPath = currentlyOpenFilePath ? await window.path.join(directoryName, fileName) : fileName

    const basename = await window.path.basename(finalPath)
    openContent(finalPath, `# ${basename}\n`)
    posthog.capture('created_new_note_from_new_note_modal')
  }, [currentlyOpenFilePath, openContent])

  const WindowContentContextMemo = useMemo(
    () => ({
      openContent,
      focusedItem,
      showContextMenu,
      hideFocusedItem,
      currentOpenFileOrChatID,
      createAndOpenNewNote: createAndOpenUntitledNote,
    }),
    [openContent, focusedItem, showContextMenu, hideFocusedItem, currentOpenFileOrChatID, createAndOpenUntitledNote],
  )

  return <WindowContentContext.Provider value={WindowContentContextMemo}>{children}</WindowContentContext.Provider>
}
