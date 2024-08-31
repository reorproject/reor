import React, { useState } from 'react'

import { FileInfoTree } from 'electron/main/filesystem/types'
import { DBQueryResult } from 'electron/main/vector-database/schema'

import { ChatsSidebar } from '../Chat/ChatsSidebar'

import SearchComponent from './FileSidebarSearch'
import { FileSidebar } from './FileSideBar'

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

      {sidebarShowing === 'chats' && <ChatsSidebar />}
    </div>
  )
}

export default SidebarManager
