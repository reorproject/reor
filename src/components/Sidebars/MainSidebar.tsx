import React, { useState } from 'react'

import { DBQueryResult } from 'electron/main/vector-database/schema'

import { ChatsSidebar } from '../Chat/ChatsSidebar'

import SearchComponent from './FileSidebarSearch'
import FileSidebar from './FileSideBar'
import { useChatContext } from '@/contexts/ChatContext'

export type SidebarAbleToShow = 'files' | 'search' | 'chats'

const SidebarManager: React.FC = () => {
  const { sidebarShowing } = useChatContext()
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<DBQueryResult[]>([])

  return (
    <div className="size-full overflow-y-hidden">
      {sidebarShowing === 'files' && <FileSidebar />}
      {sidebarShowing === 'search' && (
        <SearchComponent
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
