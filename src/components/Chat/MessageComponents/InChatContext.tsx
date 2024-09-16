import React from 'react'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { DBEntry } from 'electron/main/vector-database/schema'
import { Card, CardDescription } from '@/components/ui/card'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { useWindowContentContext } from '@/contexts/WindowContentContext'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'

interface InChatContextComponentProps {
  contextItems: FileInfoWithContent[] | DBEntry[]
}

const truncateName = (name: string, maxLength: number) => {
  if (name.length <= maxLength) return name
  return `${name.slice(0, maxLength - 3)}...`
}

const InChatContextComponent: React.FC<InChatContextComponentProps> = ({ contextItems }) => {
  const { openContent } = useWindowContentContext()

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

  if (contextItems.length === 0) {
    return null
  }

  return (
    <div>
      <div className="mb-1 text-sm text-muted-foreground">Sources:</div>

      <div className="flex space-x-4 overflow-x-auto p-0">
        {contextItems.map((contextItem) => (
          <HoverCard key={`${getItemName(contextItem)}-${getItemContent(contextItem)}`}>
            <HoverCardTrigger>
              <Card
                className="h-10 w-28 shrink-0 cursor-pointer bg-secondary p-0"
                onClick={() => openContent(getItemPath(contextItem))}
              >
                <CardDescription className="m-0 ml-5 break-all p-3 text-xs">
                  {truncateName(getItemName(contextItem), 30)}
                </CardDescription>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent>
              <MarkdownRenderer content={getItemContent(contextItem)} />
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  )
}

export default InChatContextComponent
