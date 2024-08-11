import React, { useEffect, useRef, useState } from 'react'

import { ChatHistoryMetadata } from './hooks/use-chat-history'
import { ChatHistory } from './chatUtils'
import { RiChatNewFill, RiArrowDownSLine } from "react-icons/ri";
import { IoChatbubbles } from "react-icons/io5";

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
    ${isSelected 
      ? 'bg-neutral-700 text-white' 
      : 'text-gray-300 hover:bg-neutral-800'
    }
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

  const toggleRecents = () => setIsRecentsOpen(prev => !prev)
  const togglePinned = () => setIsPinnedOpen(prev => !prev)

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
    <div className="h-full overflow-y-auto bg-neutral-800 flex flex-col px-3 pb-4 pt-2.5">
      <div className="flex h-full flex-col gap-2 text-white/90">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-6 mb-4">
          <button
            className="flex items-center justify-center gap-2 rounded-md py-3 
                      transition-colors duration-200 bg-blue-500 hover:bg-blue-400
                      shadow-md hover:shadow-lg border-0 text-white hover:text-gray-200
                      cursor-pointer"
            onClick={newChat}
          >
            <RiChatNewFill className="text-xl" />
            <span className="font-bold text-xs">
              Start New Chat
            </span>
          </button>
        </div>
          {/* Pinned Section */}
          <div className="flex min-h-0 flex-col gap-4">
            <div className="flex justify-between items-center cursor-pointer" onClick={togglePinned}>
              <h3 className="mb-1 mt-1 text-sm tracking-wider text-gray-200 font-medium">
                Pinned
              </h3>
              <RiArrowDownSLine className={`transition-transform duration-200 mt-1 ${!isPinnedOpen ? 'rotate-0' : 'rotate-180'}`} />
            </div>
          </div>

          {/* Recents Section */}
          <div className="flex-1">
            <div className="flex justify-between items-center cursor-pointer" onClick={toggleRecents}>
              <h3 className="mb-0 mt-1 text-sm tracking-wider text-gray-200 font-medium">
                Recents
              </h3>
              <RiArrowDownSLine className={`transition-transform duration-200 mt-1 ${!isRecentsOpen ? 'rotate-0' : 'rotate-180'}`} />
            </div>
            {isRecentsOpen && (
              <ul className="flex flex-col m-0 gap-0.5 p-0 list-style:none">
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
