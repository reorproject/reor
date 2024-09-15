import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { MarkdownContent } from '@/components/File/DBResultPreview'
import { useWindowContentContext } from '@/contexts/WindowContentContext'

interface RenderableContextType {
  content: string
  name: string
  path: string
}

interface InChatContextComponentProps {
  contextList: RenderableContextType[]
}

const InChatContextComponent: React.FC<InChatContextComponentProps> = ({ contextList }) => {
  const { openContent } = useWindowContentContext()
  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content
    return `${content.slice(0, maxLength)}...`
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {contextList.map((contextItem) => (
        <Card
          key={`${contextItem.name}-${contextItem.content}`}
          className="w-64 shrink-0 cursor-pointer bg-secondary"
          onClick={() => openContent(contextItem.path)}
        >
          <CardContent className="p-4 text-xs text-foreground">
            <MarkdownContent content={truncateContent(contextItem.content, 75)} />
          </CardContent>
          <CardFooter className="text-xs">
            <p>{contextItem.name}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default InChatContextComponent
