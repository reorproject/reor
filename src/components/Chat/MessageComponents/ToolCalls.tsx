import { CoreToolMessage, ToolCallPart } from 'ai'
import React, { useState } from 'react'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Chat } from '../../../lib/llm/types'
import ChatSources from './ChatSources'
import { findToolResultMatchingToolCall } from '../../../lib/llm/chat'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface ToolCallComponentProps {
  toolCallPart: ToolCallPart
  currentChat: Chat
  executeToolCall: (toolCall: ToolCallPart) => Promise<void>
}

interface ToolRendererProps {
  // eslint-disable-next-line react/no-unused-prop-types
  toolCallPart: ToolCallPart
  existingToolResult: CoreToolMessage | undefined
  // eslint-disable-next-line react/no-unused-prop-types
  executeToolCall: (toolCall: ToolCallPart) => Promise<void>
}

const SearchToolRenderer: React.FC<ToolRendererProps> = ({ existingToolResult }) => {
  const parseResult = (): FileInfoWithContent[] | null => {
    if (!existingToolResult || !existingToolResult.content[0].result) return null

    try {
      const result = existingToolResult.content[0].result as FileInfoWithContent[]
      // Optional: Add a simple check to ensure it's an array
      if (!Array.isArray(result)) throw new Error('Result is not an array')
      return result
    } catch (error) {
      return null
    }
  }

  const parsedResult = parseResult()

  return (
    <div className="mt-0 rounded border p-0">
      {/* <pre className="mt-2 overflow-x-auto bg-gray-700 p-2">
        <code>{JSON.stringify(toolCallPart.args, null, 2)}</code>
      </pre> */}
      {existingToolResult && (
        <div className="">
          {parsedResult ? (
            <ChatSources contextItems={parsedResult} />
          ) : (
            <pre className="mt-1 overflow-x-auto bg-gray-600 p-2">
              <code>{JSON.stringify(existingToolResult.content[0].result, null, 2)}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

const DefaultToolRenderer: React.FC<ToolRendererProps> = ({ toolCallPart, existingToolResult, executeToolCall }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2 rounded-md border border-border bg-secondary">
      <div className="flex items-center justify-between px-3 py-2">
        <h4 className="text-sm font-medium text-secondary-foreground">Tool Call: {toolCallPart.toolName}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="size-6 p-0">
            {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="border-t border-border px-3 py-2">
          <h5 className="mb-1 text-xs font-medium text-muted-foreground">Arguments:</h5>
          {Object.entries(toolCallPart.args as Record<string, unknown>).map(([key, value]) => (
            <div key={key} className="text-xs">
              <span className="font-medium text-secondary-foreground">{key}:</span>{' '}
              <span className="text-muted-foreground">{JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
        {existingToolResult && (
          <div className="border-t border-border px-3 py-2">
            <h5 className="mb-1 text-xs font-medium text-muted-foreground">Result:</h5>
            <div className="text-xs text-secondary-foreground">
              {JSON.stringify(existingToolResult.content[0].result)}
            </div>
          </div>
        )}
        {!existingToolResult && (
          <div className="border-t border-border px-3 py-2">
            <Button onClick={() => executeToolCall(toolCallPart)} size="sm" className="w-full text-xs">
              Execute Tool Call
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

export const ToolCallComponent: React.FC<ToolCallComponentProps> = ({ toolCallPart, currentChat, executeToolCall }) => {
  const existingToolResult = findToolResultMatchingToolCall(toolCallPart.toolCallId, currentChat.messages)

  return (
    <>
      {toolCallPart.toolName === 'search' && (
        <SearchToolRenderer
          toolCallPart={toolCallPart}
          existingToolResult={existingToolResult}
          executeToolCall={executeToolCall}
        />
      )}
      {toolCallPart.toolName !== 'search' && (
        <DefaultToolRenderer
          toolCallPart={toolCallPart}
          existingToolResult={existingToolResult}
          executeToolCall={executeToolCall}
        />
      )}
    </>
  )
}

export default ToolCallComponent
