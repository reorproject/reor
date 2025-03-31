import React, { useState } from 'react'

import { DBQueryResult } from 'electron/main/vector-database/schema'

import { YStack } from 'tamagui'
import { ChatSidebar } from '../Chat/ChatSidebar'

import SearchComponent from './SearchComponent'
import { useChatContext } from '@/contexts/ChatContext'
import FileSidebar from './FileSideBar/FileSidebar'

export type SidebarAbleToShow = 'files' | 'search' | 'chats'

const SidebarManager: React.FC = () => {
  const { sidebarShowing } = useChatContext()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<DBQueryResult[]>([])

  return (
    <YStack className="size-full overflow-y-hidden">
      {sidebarShowing === 'files' && <FileSidebar />}

      {sidebarShowing === 'search' && (
        <SearchComponent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
        />
      )}

      {sidebarShowing === 'chats' && <ChatSidebar />}
    </YStack>
  )
}

export default SidebarManager
