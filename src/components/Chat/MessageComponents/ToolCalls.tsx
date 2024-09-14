import { CoreToolMessage, ToolCallPart } from 'ai'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { toast } from 'react-toastify'
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

interface ToolCallComponentProps {
  toolCallPart: ToolCallPart
  currentChat: Chat
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
}

export const ToolCallComponent: React.FC<ToolCallComponentProps> = ({ toolCallPart, currentChat, setCurrentChat }) => {
  const { saveChat } = useChatContext()

  const findToolResultMatchingToolCall = (toolCallId: string) => {
    return currentChat.messages.find(
      (message) => message.role === 'tool' && message.content.some((content) => content.toolCallId === toolCallId),
    )
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

  return (
    <div className="mt-0 rounded border border-gray-300 p-0">
      <h4 className="font-bold">Tool Call: {toolCallPart.toolName}</h4>
      <pre className="mt-2 overflow-x-auto bg-gray-700 p-2">
        <code>{JSON.stringify(toolCallPart.args, null, 2)}</code>
      </pre>
      <button
        type="button"
        onClick={executeToolCall}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Execute Tool Call
      </button>
    </div>
  )
}

// useEffect(async () => {
//   const toolDefinition = currentChat.toolDefinitions.find((tool) => tool.name === part.toolName)
//   if (toolDefinition?.autoRun) {
//     await handleToolCall()
//     // TODO: if all tool calls have corresponding tool results,
//     // a regeneration should be run
//   }
// }, [currentChat.toolDefinitions, handleToolCall, part])
