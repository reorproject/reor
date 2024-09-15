import { CoreToolMessage, ToolCallPart } from 'ai'
import React from 'react'
import { toast } from 'react-toastify'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { FileInfoWithContent } from 'electron/main/filesystem/types'
import { useChatContext } from '@/contexts/ChatContext'
import { Chat } from '../types'
import { createToolResult } from '../tools'
import ToolCallCards from './InChatContext'

interface TextPartProps {
  text: string
}

export const TextPart: React.FC<TextPartProps> = ({ text }) => (
  <ReactMarkdown rehypePlugins={[rehypeRaw]} className="max-w-[95%] break-words">
    {text}
  </ReactMarkdown>
)

interface ToolCallComponentProps {
  toolCallPart: ToolCallPart
  currentChat: Chat
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
}

interface ToolRendererProps {
  toolCallPart: ToolCallPart
  existingToolResult: CoreToolMessage | undefined
  executeToolCall: () => Promise<void>
}

const SearchToolRenderer: React.FC<ToolRendererProps> = ({ toolCallPart, existingToolResult, executeToolCall }) => {
  const parseResult = (): FileInfoWithContent[] | null => {
    if (!existingToolResult || !existingToolResult.content[0].result) return null

    try {
      const result = existingToolResult.content[0].result as FileInfoWithContent[]
      // Optional: Add a simple check to ensure it's an array
      if (!Array.isArray(result)) throw new Error('Result is not an array')
      return result
    } catch (error) {
      console.error('Failed to parse result as FileInfoWithContent[]:', error)
      return null
    }
  }

  const parsedResult = parseResult()

  return (
    <div className="mt-0 rounded border border-gray-600 p-0">
      <h4 className="font-bold">Search Tool Call</h4>
      <pre className="mt-2 overflow-x-auto bg-gray-700 p-2">
        <code>{JSON.stringify(toolCallPart.args, null, 2)}</code>
      </pre>
      {existingToolResult ? (
        <div className="mt-2 bg-gray-100 p-2">
          <h5 className="font-semibold">Search Results:</h5>
          {parsedResult ? (
            <ToolCallCards toolCalls={parsedResult} />
          ) : (
            <pre className="mt-1 overflow-x-auto bg-gray-600 p-2">
              <code>{JSON.stringify(existingToolResult.content[0].result, null, 2)}</code>
            </pre>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={executeToolCall}
          className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Execute Search
        </button>
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
        onClick={executeToolCall}
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
        onClick={executeToolCall}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Execute Tool Call
      </button>
    )}
  </div>
)

export const ToolCallComponent: React.FC<ToolCallComponentProps> = ({ toolCallPart, currentChat, setCurrentChat }) => {
  const { saveChat } = useChatContext()

  const findToolResultMatchingToolCall = (toolCallId: string): CoreToolMessage | undefined => {
    const toolMessage = currentChat.messages.find(
      (message) => message.role === 'tool' && message.content.some((content) => content.toolCallId === toolCallId),
    )
    return toolMessage as CoreToolMessage | undefined
  }

  const executeToolCall = async () => {
    const existingToolResult = findToolResultMatchingToolCall(toolCallPart.toolCallId)
    if (existingToolResult) {
      toast.error('Tool call id already exists')
      return
    }

    const toolResult = await createToolResult(toolCallPart.toolName, toolCallPart.args as any, toolCallPart.toolCallId)
    const toolMessage: CoreToolMessage = {
      role: 'tool',
      content: [toolResult],
    }

    setCurrentChat((prevChat) => {
      if (!prevChat) return prevChat
      const updatedChat = {
        ...prevChat,
        messages: [...prevChat.messages, toolMessage],
      }
      saveChat(updatedChat)
      return updatedChat
    })
  }

  const existingToolResult = findToolResultMatchingToolCall(toolCallPart.toolCallId)

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
