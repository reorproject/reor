import React, { useState } from 'react'

import { DBQueryResult } from 'electron/main/vector-database/schema'

import { ChatsSidebar } from '../Chat/ChatsSidebar'

import SearchComponent from './FileSidebarSearch'
import FileSidebar from './FileSideBar'

export type SidebarAbleToShow = 'files' | 'search' | 'chats'
interface SidebarManagerProps {
  onFileSelect: (path: string) => void
  sidebarShowing: SidebarAbleToShow
}

const SidebarManager: React.FC<SidebarManagerProps> = ({ onFileSelect, sidebarShowing }) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<DBQueryResult[]>([])

  return (
    <div className="size-full overflow-y-hidden">
      {sidebarShowing === 'files' && <FileSidebar onFileSelect={onFileSelect} />}
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
