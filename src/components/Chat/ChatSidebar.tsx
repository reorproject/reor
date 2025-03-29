import React, { useState } from 'react'
import { IoChatbubbles } from 'react-icons/io5'
import { RiChatNewFill, RiArrowDownSLine } from 'react-icons/ri'
import { YStack, XStack, SizableText } from 'tamagui'
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

  const isSelected = chatMetadata.id === currentChat?.id
  const itemClasses = `
    flex items-center cursor-pointer py-2 px-3 rounded-md font-sans text-xs leading-relaxed
    transition-colors duration-150 ease-in-out
    ${chatMetadata.id === currentChat?.id ? 'text-white' : 'text-gray-300'}
  `

  const handleDeleteChat = () => {
    // eslint-disable-next-line no-alert
    const isConfirmed = window.confirm(`Are you sure you want to delete the chat "${chatMetadata.displayName}"?`)
    if (isConfirmed) {
      deleteChat(chatMetadata.id)
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <XStack
          backgroundColor={isSelected ? '$gray7' : undefined}
          gap="$2"
          alignItems="center"
          hoverStyle={{
            backgroundColor: '$gray7',
          }}
          onPress={() => openContent(chatMetadata.id)}
          className={itemClasses}
        >
          <IoChatbubbles />
          <SizableText fontSize={11} fontWeight={500} ellipse className="flex-1">
            {chatMetadata.displayName}
          </SizableText>
        </XStack>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={handleDeleteChat}>Delete Chat</ContextMenuItem>
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
    <YStack backgroundColor="$gray3" className="flex h-full flex-col overflow-y-auto px-2 pb-4 pt-2.5">
      <div className="flex h-full flex-col gap-2">
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="mb-4 flex flex-col gap-6">
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md 
                      border-0 bg-blue-500 py-3 text-white
                      shadow-md transition-colors duration-200 hover:bg-blue-400 hover:text-gray-200
                      hover:shadow-lg"
              type="button"
              onClick={() => openNewChat(undefined)}
            >
              <RiChatNewFill className="text-xl" />
              <span className="text-xs font-bold">Start New Chat</span>
            </button>
          </div>

          <div className="flex-1">
            <XStack className="flex cursor-pointer items-center justify-between" onPress={toggleRecents}>
              <h4 className="mb-0 mt-1 text-xs font-medium tracking-wider">Recents</h4>
              <RiArrowDownSLine
                className={`mt-1 transition-transform duration-200 ${!isRecentsOpen ? 'rotate-0' : 'rotate-180'}`}
              />
            </XStack>
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
    </YStack>
  )
}
