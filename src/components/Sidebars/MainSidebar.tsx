import React, { useState } from 'react'

import { FileInfoTree } from 'electron/main/filesystem/types'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'

import { ChatsSidebar } from '../Chat/ChatsSidebar'
import { ChatHistoryMetadata } from '../Chat/hooks/use-chat-history'
import { FileSidebar } from '../File/FileSideBar'

import SearchComponent from './FileSidebarSearch'
import { ChatFilters, ChatHistory } from '../Chat/chatUtils'

export type SidebarAbleToShow = 'files' | 'search' | 'chats'
interface SidebarManagerProps {
  files: FileInfoTree
  expandedDirectories: Map<string, boolean>
  handleDirectoryToggle: (path: string) => void
  selectedFilePath: string | null
  onFileSelect: (path: string) => void
  sidebarShowing: SidebarAbleToShow
  renameFile: (oldFilePath: string, newFilePath: string) => Promise<void>
  noteToBeRenamed: string
  setNoteToBeRenamed: (note: string) => void
  fileDirToBeRenamed: string
  setFileDirToBeRenamed: (dir: string) => void
  currentChatHistory: ChatHistory | undefined
  chatHistoriesMetadata: ChatHistoryMetadata[]
  setCurrentChatHistory: (chat: ChatHistory | undefined) => void
  setChatFilters: (chatFilters: ChatFilters) => void
  setShowChatbot: (showChat: boolean) => void
}

const SidebarManager: React.FC<SidebarManagerProps> = ({
  files,
  expandedDirectories,
  handleDirectoryToggle,
  selectedFilePath,
  onFileSelect,
  sidebarShowing,
  renameFile,
  noteToBeRenamed,
  setNoteToBeRenamed,
  fileDirToBeRenamed,
  setFileDirToBeRenamed,
  currentChatHistory,
  chatHistoriesMetadata,
  setCurrentChatHistory,
  setChatFilters,
  setShowChatbot,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<DBQueryResult[]>([])

  return (
    <div className="size-full overflow-y-hidden">
      {sidebarShowing === 'files' && (
        <FileSidebar
          files={files}
          expandedDirectories={expandedDirectories}
          handleDirectoryToggle={handleDirectoryToggle}
          selectedFilePath={selectedFilePath}
          onFileSelect={onFileSelect}
          renameFile={renameFile}
          noteToBeRenamed={noteToBeRenamed}
          setNoteToBeRenamed={setNoteToBeRenamed}
          fileDirToBeRenamed={fileDirToBeRenamed}
          setFileDirToBeRenamed={setFileDirToBeRenamed}
        />
      )}
      {sidebarShowing === 'search' && (
        <SearchComponent
          onFileSelect={onFileSelect}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
        />
      )}

      {sidebarShowing === 'chats' && (
        <ChatsSidebar
          chatHistoriesMetadata={chatHistoriesMetadata}
          currentChatHistory={currentChatHistory}
          onSelect={(chatID) => {
            async function fetchChatHistory() {
              const chat = await window.electronStore.getChatHistory(chatID)
              setCurrentChatHistory(chat)
            }
            fetchChatHistory()
          }}
          newChat={() => {
            posthog.capture('create_new_chat')
            setCurrentChatHistory(undefined)

            setChatFilters({
              files: [],
              numberOfChunksToFetch: 15,
              minDate: new Date(0),
              maxDate: new Date(),
            })
          }}
          setShowChatbot={setShowChatbot}
        />
      )}
    </div>
  )
}

export default SidebarManager
