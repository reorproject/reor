import React, { createContext, useContext, useMemo, ReactNode, useState, useCallback } from 'react'

import posthog from 'posthog-js'
import { useChatContext } from './ChatContext'
import { useFileContext } from './FileContext'
import { getFilesInDirectory, getNextAvailableFileNameGivenBaseName } from '@/lib/file'

interface ContentContextType {
  openContent: (pathOrChatID: string, optionalContentToWriteOnCreate?: string, dontUpdateChatHistory?: boolean) => void
  currentOpenFileOrChatID: string | null
  createUntitledNote: (parentFileOrDirectory?: string) => void
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export const useContentContext = (): ContentContextType => {
  const context = useContext(ContentContext)
  if (context === undefined) {
    throw new Error('useContentContext must be used within a ContentProvider')
  }
  return context
}

interface ContentProviderProps {
  children: ReactNode
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [currentOpenFileOrChatID, setCurrentOpenFileOrChatID] = useState<string | null>(null)

  const { allChatsMetadata, setShowChatbot, openNewChat } = useChatContext()
  const {
    vaultFilesFlattened: flattenedFiles,
    openOrCreateFile,
    addToNavigationHistory,
    currentlyOpenFilePath,
  } = useFileContext()

  const openContent = React.useCallback(
    async (pathOrChatID: string, optionalContentToWriteOnCreate?: string, dontUpdateChatHistory?: boolean) => {
      if (!pathOrChatID) return
      const chatMetadata = allChatsMetadata.find((chat) => chat.id === pathOrChatID)
      if (chatMetadata) {
        setShowChatbot(true)
        openNewChat(pathOrChatID)
      } else {
        setShowChatbot(false)
        openOrCreateFile(pathOrChatID, optionalContentToWriteOnCreate)
      }
      setCurrentOpenFileOrChatID(pathOrChatID)
      if (!dontUpdateChatHistory) {
        addToNavigationHistory(pathOrChatID)
      }
    },
    [allChatsMetadata, setShowChatbot, openNewChat, openOrCreateFile, addToNavigationHistory],
  )

  const createUntitledNote = useCallback(
    async (parentDirectory?: string) => {
      console.log('parentDirectory: ', parentDirectory)
      const directoryToMakeFileIn =
        parentDirectory ||
        (currentlyOpenFilePath && (await window.path.dirname(currentlyOpenFilePath))) ||
        (await window.electronStore.getVaultDirectoryForWindow())
      const filesInDirectory = await getFilesInDirectory(directoryToMakeFileIn, flattenedFiles)
      const fileName = getNextAvailableFileNameGivenBaseName(
        filesInDirectory.map((file) => file.name),
        'Untitled',
      )
      const finalPath = await window.path.join(directoryToMakeFileIn, fileName)
      openContent(finalPath, `## `)
      posthog.capture('created_new_note_from_new_note_modal')
    },
    [currentlyOpenFilePath, flattenedFiles, openContent],
  )

  const ContentContextMemo = useMemo(
    () => ({
      openContent,
      currentOpenFileOrChatID,
      createUntitledNote,
    }),
    [openContent, currentOpenFileOrChatID, createUntitledNote],
  )

  return <ContentContext.Provider value={ContentContextMemo}>{children}</ContentContext.Provider>
}
