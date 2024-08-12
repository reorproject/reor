import React, { useEffect, useRef, useState } from 'react'

import { RiChatNewFill, RiArrowDownSLine } from 'react-icons/ri'
import { IoChatbubbles } from 'react-icons/io5'
import { ChatHistoryMetadata } from './hooks/use-chat-history'
import { ChatHistory } from './chatUtils'

export interface ChatItemProps {
  chatMetadata: ChatHistoryMetadata
  selectedChatID: string | null
  onChatSelect: (path: string) => void
  // currentSelectedChatID: React.MutableRefObject<string | undefined>
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chatMetadata,
  selectedChatID,
  onChatSelect,
  // currentSelectedChatID,
}) => {
  const isSelected = chatMetadata.id === selectedChatID

  const itemClasses = `
    flex items-center cursor-pointer py-2 px-3 rounded-md
    transition-colors duration-150 ease-in-out
    ${isSelected ? 'bg-neutral-700 text-white' : 'text-gray-300 hover:bg-neutral-800'}
  `

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    window.electronUtils.showChatItemContext(chatMetadata)
  }

  return (
    <div>
      <div
        onClick={() => {
          onChatSelect(chatMetadata.id)
          // currentSelectedChatID.current = chatMetadata.id
        }}
        className={itemClasses}
        onContextMenu={handleContextMenu}
      >
        <IoChatbubbles />
        <span className="ml-2 flex-1 truncate text-sm font-medium">{chatMetadata.displayName}</span>
      </div>
    </div>
  )
}

interface ChatListProps {
  chatHistoriesMetadata: ChatHistoryMetadata[]
  currentChatHistory: ChatHistory | undefined
  onSelect: (chatID: string) => void
  newChat: () => void
  setShowChatbot: (showChat: boolean) => void
}

export const ChatsSidebar: React.FC<ChatListProps> = ({
  chatHistoriesMetadata,
  currentChatHistory,
  onSelect,
  newChat,
  setShowChatbot,
}) => {
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)
  const [isRecentsOpen, setIsRecentsOpen] = useState(true)
  const dropdownAnimationDelay = 0.2

  const toggleRecents = () => setIsRecentsOpen((prev) => !prev)
  const togglePinned = () => setIsPinnedOpen((prev) => !prev)

  const currentSelectedChatID = useRef<string | undefined>()
  useEffect(() => {}, [chatHistoriesMetadata])
  useEffect(() => {
    const deleteChatRow = window.ipcRenderer.receive('remove-chat-at-id', (chatID) => {
      // const filteredData = chatHistoriesMetadata.filter(
      //   (item) => item.id !== chatID
      // );
      // setChatHistoriesMetadata(filteredData.reverse());
      if (chatID === currentSelectedChatID.current) {
        setShowChatbot(false)
      }
      window.electronStore.removeChatHistoryAtID(chatID)
    })

    return () => {
      deleteChatRow()
    }
  }, [chatHistoriesMetadata, setShowChatbot])

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-neutral-800 px-3 pb-4 pt-2.5">
      <div className="flex h-full flex-col gap-2 text-white/90">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="mb-4 flex flex-col gap-6">
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md 
                      border-0 bg-blue-500 py-3 text-white
                      shadow-md transition-colors duration-200 hover:bg-blue-400 hover:text-gray-200
                      hover:shadow-lg"
              onClick={newChat}
            >
              <RiChatNewFill className="text-xl" />
              <span className="text-xs font-bold">Start New Chat</span>
            </button>
          </div>
          {/* Pinned Section */}
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex cursor-pointer items-center justify-between" onClick={togglePinned}>
              <h3 className="my-1 text-sm font-medium tracking-wider text-gray-200">Pinned</h3>
              <RiArrowDownSLine
                className={`mt-1 transition-transform duration-200 ${!isPinnedOpen ? 'rotate-0' : 'rotate-180'}`}
              />
            </div>
          </div>

          {/* Recents Section */}
          <div className="flex-1">
            <div className="flex cursor-pointer items-center justify-between" onClick={toggleRecents}>
              <h3 className="mb-0 mt-1 text-sm font-medium tracking-wider text-gray-200">Recents</h3>
              <RiArrowDownSLine
                className={`mt-1 transition-transform duration-200 ${!isRecentsOpen ? 'rotate-0' : 'rotate-180'}`}
              />
            </div>
            {isRecentsOpen && (
              <ul className="list-style:none m-0 flex flex-col gap-0.5 p-0">
                {chatHistoriesMetadata
                  .slice()
                  .reverse()
                  .map((chatMetadata, index) => (
                    <li
                      key={chatMetadata.id}
                      style={{ animationDelay: `${index * dropdownAnimationDelay}s` }}
                      className="animate-dropdown-fadeIn"
                    >
                      <ChatItem
                        chatMetadata={chatMetadata}
                        selectedChatID={currentChatHistory?.id || ''}
                        onChatSelect={onSelect}
                      />
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
