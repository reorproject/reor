import React, { useState } from 'react'
import { IoChatbubbles } from 'react-icons/io5'
import { RiChatNewFill, RiArrowDownSLine } from 'react-icons/ri'
import { useChatContext } from '@/contexts/ChatContext'
import { useContentContext } from '@/contexts/ContentContext'
import { ChatMetadata } from '../../lib/llm/types'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'

export interface ChatItemProps {
  chatMetadata: ChatMetadata
}

export const ChatItem: React.FC<ChatItemProps> = ({ chatMetadata }) => {
  const { currentChat, deleteChat } = useChatContext()
  const { openContent } = useContentContext()

  const itemClasses = `
    flex items-center cursor-pointer py-2 px-3 rounded-md
    transition-colors duration-150 ease-in-out
    ${chatMetadata.id === currentChat?.id ? 'bg-neutral-700 text-white' : 'text-gray-300 hover:bg-neutral-800'}
  `
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div onClick={() => openContent(chatMetadata.id)} className={itemClasses}>
          <IoChatbubbles />
          <span className="ml-2 flex-1 truncate text-[11px] font-medium">{chatMetadata.displayName}</span>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => deleteChat(chatMetadata.id)}>Delete Chat</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export const ChatSidebar: React.FC = () => {
  const [isRecentsOpen, setIsRecentsOpen] = useState(true)
  const dropdownAnimationDelay = 0.02

  const { allChatsMetadata, openNewChat } = useChatContext()

  const toggleRecents = () => setIsRecentsOpen((prev) => !prev)

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
              onClick={() => openNewChat()}
            >
              <RiChatNewFill className="text-xl" />
              <span className="text-xs font-bold">Start New Chat</span>
            </button>
          </div>

          <div className="flex-1">
            <div className="flex cursor-pointer items-center justify-between" onClick={toggleRecents}>
              <h4 className="mb-0 mt-1 text-xs font-medium tracking-wider text-gray-200">Recents</h4>
              <RiArrowDownSLine
                className={`mt-1 transition-transform duration-200 ${!isRecentsOpen ? 'rotate-0' : 'rotate-180'}`}
              />
            </div>
            {isRecentsOpen && (
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {allChatsMetadata
                  .slice()
                  .sort((a, b) => b.timeOfLastMessage - a.timeOfLastMessage)
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
