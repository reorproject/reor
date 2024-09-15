import React from 'react'
import { Card, CardDescription } from '@/components/ui/card'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'
import { useWindowContentContext } from '@/contexts/WindowContentContext'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'

interface RenderableContextType {
  content: string
  name: string
  path: string
}

interface InChatContextComponentProps {
  contextList: RenderableContextType[]
}

const truncateName = (name: string, maxLength: number) => {
  if (name.length <= maxLength) return name
  return `${name.slice(0, maxLength - 3)}...`
}

const InChatContextComponent: React.FC<InChatContextComponentProps> = ({ contextList }) => {
  const { openContent } = useWindowContentContext()

  return (
    <div>
      <div className="mb-1 text-sm text-muted-foreground">Sources:</div>

      <div className="flex space-x-4 overflow-x-auto p-0">
        {contextList.map((contextItem) => (
          <HoverCard key={`${contextItem.name}-${contextItem.content}`}>
            <HoverCardTrigger>
              <Card
                className="h-10 w-28 shrink-0 cursor-pointer bg-secondary p-0"
                onClick={() => openContent(contextItem.path)}
              >
                <CardDescription className="m-0 ml-5 break-all p-3 text-xs">
                  {truncateName(contextItem.name, 30)}
                </CardDescription>
              </Card>
            </HoverCardTrigger>
            <HoverCardContent>
              <MarkdownRenderer content={contextItem.content} />
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  )
}

export default InChatContextComponent
