import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface ToolCall {
  content: string
  name: string
}

interface ToolCallCardsProps {
  toolCalls: ToolCall[]
}

const ToolCallCards: React.FC<ToolCallCardsProps> = ({ toolCalls }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {toolCalls.map((toolCall) => (
        <Card key={`${toolCall.name}-${toolCall.content}`} className="w-64 shrink-0">
          <CardContent className="p-4">
            <p>{toolCall.content}</p>
          </CardContent>
          <CardFooter className="p-4">
            <p>{toolCall.name}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default ToolCallCards
