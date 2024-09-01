import React, { useEffect, useRef, useState } from 'react'

import { RiChatNewFill, RiArrowDownSLine } from 'react-icons/ri'
import { IoChatbubbles } from 'react-icons/io5'
import posthog from 'posthog-js'
import { ChatHistoryMetadata } from './hooks/use-chat-history'
import { useChatContext } from '@/contexts/ChatContext'

export interface ChatItemProps {
  chatMetadata: ChatHistoryMetadata
}

export const ChatItem: React.FC<ChatItemProps> = ({ chatMetadata }) => {
  const { setCurrentChatHistory, currentChatHistory } = useChatContext()

  const itemClasses = `
    flex items-center cursor-pointer py-2 px-3 rounded-md
    transition-colors duration-150 ease-in-out
    ${chatMetadata.id === currentChatHistory?.id ? 'bg-neutral-700 text-white' : 'text-gray-300 hover:bg-neutral-800'}
  `

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    window.electronUtils.showChatItemContext(chatMetadata)
  }

  return (
    <div>
      <div
        onClick={async () => {
          const chat = await window.electronStore.getChatHistory(chatMetadata.id)
          setCurrentChatHistory(chat)
        }}
        className={itemClasses}
        onContextMenu={handleContextMenu}
      >
        <IoChatbubbles />
        <span className="ml-2 flex-1 truncate text-[11px] font-medium">{chatMetadata.displayName}</span>
      </div>
    </div>
  )
}

export const ChatsSidebar: React.FC = () => {
  const [isRecentsOpen, setIsRecentsOpen] = useState(true)
  const dropdownAnimationDelay = 0.2

  const { setShowChatbot, chatHistoriesMetadata, setCurrentChatHistory, setChatFilters } = useChatContext()

  const toggleRecents = () => setIsRecentsOpen((prev) => !prev)

  const currentSelectedChatID = useRef<string | undefined>()
  useEffect(() => {
    const deleteChatRow = window.ipcRenderer.receive('remove-chat-at-id', (chatID) => {
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
    <div className="flex h-full flex-col overflow-y-auto bg-neutral-800 px-2 pb-4 pt-2.5">
      <div className="flex h-full flex-col gap-2 text-white/90">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="mb-4 flex flex-col gap-6">
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md 
                      border-0 bg-blue-500 py-3 text-white
                      shadow-md transition-colors duration-200 hover:bg-blue-400 hover:text-gray-200
                      hover:shadow-lg"
              type="button"
              onClick={() => {
                posthog.capture('create_new_chat')
                setCurrentChatHistory(undefined)

                setChatFilters({
                  files: [],
                  numberOfChunksToFetch: 15,
                  minDate: new Date(0),
                  maxDate: new Date(),
                })
              }}
            >
              <RiChatNewFill className="text-xl" />
              <span className="text-xs font-bold">Start New Chat</span>
            </button>
          </div>

          {/* Recents Section */}
          <div className="flex-1">
            <div className="flex cursor-pointer items-center justify-between" onClick={toggleRecents}>
              <h4 className="mb-0 mt-1 text-xs font-medium tracking-wider text-gray-200">Recents</h4>
              <RiArrowDownSLine
                className={`mt-1 transition-transform duration-200 ${!isRecentsOpen ? 'rotate-0' : 'rotate-180'}`}
              />
            </div>
            {isRecentsOpen && (
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {chatHistoriesMetadata
                  .slice()
                  .reverse()
                  .map((chatMetadata, index) => (
                    <li
                      key={chatMetadata.id}
                      style={{ animationDelay: `${index * dropdownAnimationDelay}s` }}
                      className="animate-dropdown-fadeIn"
                    >
                      <ChatItem chatMetadata={chatMetadata} />
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
