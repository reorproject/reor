import React from 'react'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'
import { Card, CardDescription } from '@/components/ui/card'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { useContentContext } from '@/contexts/ContentContext'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'

interface ChatSourcesProps {
  contextItems: FileInfoWithContent[] | DBEntry[]
}

const truncateName = (name: string, maxLength: number) => {
  if (name.length <= maxLength) return name
  return `${name.slice(0, maxLength - 3)}...`
}

const ChatSources: React.FC<ChatSourcesProps> = ({ contextItems }) => {
  const { openContent } = useContentContext()

  const isDBEntry = (item: FileInfoWithContent | DBEntry): item is DBEntry => {
    return 'notepath' in item
  }

  const getItemName = (item: FileInfoWithContent | DBEntry) => {
    if (isDBEntry(item)) {
      return item.notepath.split('/').pop() || ''
    }
    return item.name
  }

  const getItemPath = (item: FileInfoWithContent | DBEntry) => {
    return isDBEntry(item) ? item.notepath : item.path
  }

  const getItemContent = (item: FileInfoWithContent | DBEntry) => {
    return item.content
  }

  const handleOpenContent = (path: string) => {
    openContent(path)
    posthog.capture('open_content_from_chat_sources')
  }

  if (contextItems.length === 0) {
    return null
  }

  return (
    <div>
      <div className="mb-1 text-sm text-muted-foreground">Sources:</div>

      <div className="flex space-x-2 overflow-x-auto p-0 pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">
        {contextItems.map((contextItem) => (
          <HoverCard key={getItemPath(contextItem)} openDelay={600}>
            <HoverCardTrigger>
              <Card
                className="flex h-10 w-28 shrink-0 cursor-pointer items-center justify-center bg-secondary"
                onClick={() => handleOpenContent(getItemPath(contextItem))}
              >
                <CardDescription className="overflow-hidden break-all px-1 text-center text-xs">
                  {truncateName(getItemName(contextItem), 20)}
                </CardDescription>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent className="z-[100] max-h-[60vh] w-80 overflow-y-auto" sideOffset={5}>
              <div className="">
                <MarkdownRenderer content={getItemContent(contextItem)} />
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  )
}

export default ChatSources
