import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { MarkdownContent } from '@/components/File/DBResultPreview'

interface ToolCall {
  content: string
  name: string
}

interface ToolCallCardsProps {
  toolCalls: ToolCall[]
}

const ToolCallCards: React.FC<ToolCallCardsProps> = ({ toolCalls }) => {
  const truncateContent = (content: string, maxLength: number) => {
    if (content.length <= maxLength) return content
    return `${content.slice(0, maxLength)}...`
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {toolCalls.map((toolCall) => (
        <Card key={`${toolCall.name}-${toolCall.content}`} className="w-64 shrink-0">
          <CardContent className="p-4 text-xs">
            <MarkdownContent content={truncateContent(toolCall.content, 75)} />
          </CardContent>
          <CardFooter className="text-xs">
            <p>{toolCall.name}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default ToolCallCards
