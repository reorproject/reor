import { CoreToolMessage, ToolCallPart } from 'ai'
import React from 'react'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { Chat } from '../types'
import InChatContextComponent from './InChatContext'
import { findToolResultMatchingToolCall } from '../utils'

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
            <InChatContextComponent contextItems={parsedResult} />
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

const CreateFileToolRenderer: React.FC<ToolRendererProps> = ({ toolCallPart, existingToolResult, executeToolCall }) => (
  <div className="mt-0 rounded border border-gray-600 p-0">
    <h4 className="font-bold">Create File Tool Call</h4>
    <pre className="mt-2 overflow-x-auto bg-gray-700 p-2">
      <code>{JSON.stringify(toolCallPart.args, null, 2)}</code>
    </pre>
    {existingToolResult ? (
      <div className="mt-2 bg-gray-100 p-2">
        <h5 className="font-semibold">File Creation Result:</h5>
        <pre className="mt-1 overflow-x-auto bg-gray-600 p-2">
          <code>{JSON.stringify(existingToolResult.content[0].result, null, 2)}</code>
        </pre>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => executeToolCall(toolCallPart)}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Create File
      </button>
    )}
  </div>
)

const DefaultToolRenderer: React.FC<ToolRendererProps> = ({ toolCallPart, existingToolResult, executeToolCall }) => (
  <div className="mt-0 rounded border border-gray-600 p-0">
    <h4 className="font-bold">Tool Call: {toolCallPart.toolName}</h4>
    <pre className="mt-2 overflow-x-auto bg-gray-700 p-2">
      <code>{JSON.stringify(toolCallPart.args, null, 2)}</code>
    </pre>
    {existingToolResult ? (
      <div className="mt-2 bg-gray-100 p-2">
        <h5 className="font-semibold">Tool Result:</h5>
        <pre className="mt-1 overflow-x-auto bg-gray-600 p-2">
          <code>{JSON.stringify(existingToolResult.content[0].result, null, 2)}</code>
        </pre>
      </div>
    ) : (
      <button
        type="button"
        onClick={() => executeToolCall(toolCallPart)}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Execute Tool Call
      </button>
    )}
  </div>
)

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
      {toolCallPart.toolName === 'create-file' && (
        <CreateFileToolRenderer
          toolCallPart={toolCallPart}
          existingToolResult={existingToolResult}
          executeToolCall={executeToolCall}
        />
      )}
      {toolCallPart.toolName !== 'search' && toolCallPart.toolName !== 'create-file' && (
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
