import React, { useState } from 'react'

import { DBQueryResult } from 'electron/main/vector-database/schema'

import { ChatSidebar } from '../Chat/ChatSidebar'

import SearchComponent from './SearchComponent'
import { useChatContext } from '@/contexts/ChatContext'
import FileExplorer from './FileSideBar/FileExplorer'

export type SidebarAbleToShow = 'files' | 'search' | 'chats'

const SidebarManager: React.FC = () => {
  const { sidebarShowing } = useChatContext()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<DBQueryResult[]>([])

  return (
    <div className="size-full overflow-y-hidden">
      {sidebarShowing === 'files' && <FileExplorer />}

      {sidebarShowing === 'search' && (
        <SearchComponent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
        />
      )}

      {sidebarShowing === 'chats' && <ChatSidebar />}
    </div>
  )
}

export default SidebarManager
