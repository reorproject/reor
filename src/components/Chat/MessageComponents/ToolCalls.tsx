import { CoreToolMessage, ToolCallPart } from 'ai'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { Chat } from '../types'
import { createToolResult } from '../tools'
import { useChatContext } from '@/contexts/ChatContext'

interface TextPartProps {
  text: string
}

export const TextPart: React.FC<TextPartProps> = ({ text }) => (
  <ReactMarkdown rehypePlugins={[rehypeRaw]} className="max-w-[95%] break-words">
    {text}
  </ReactMarkdown>
)

interface ToolCallPartProps {
  part: ToolCallPart
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
}

export const ToolCallPartComponent: React.FC<ToolCallPartProps> = ({ part, setCurrentChat }) => {
  const { saveChat } = useChatContext()
  const handleToolCall = async () => {
    const toolResult = await createToolResult(part.toolName, part.args as any, part.toolCallId)
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

  return (
    <div className="mt-0 rounded border border-gray-300 p-0">
      <h4 className="font-bold">Tool Call: {part.toolName}</h4>
      <pre className="mt-2 overflow-x-auto bg-gray-700 p-2">
        <code>{JSON.stringify(part.args, null, 2)}</code>
      </pre>
      <button
        type="button"
        onClick={handleToolCall}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Execute Tool Call
      </button>
    </div>
  )
}
