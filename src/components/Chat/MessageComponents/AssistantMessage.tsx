import React, { useCallback, useEffect } from 'react'
import { HiOutlinePencilAlt } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { CoreToolMessage, ToolCallPart } from 'ai'
import { FaRegCopy } from 'react-icons/fa'
import { Chat, AgentConfig, ReorChatMessage } from '../types'
import {
  extractMessagePartsFromAssistantMessage,
  findToolResultMatchingToolCall,
  getClassNameBasedOnMessageRole,
} from '../utils'
import { ToolCallComponent } from './ToolCalls'
import { useWindowContentContext } from '@/contexts/WindowContentContext'
import { createToolResult } from '../tools'
import { useChatContext } from '@/contexts/ChatContext'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'

interface AssistantMessageProps {
  message: ReorChatMessage
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
  currentChat: Chat
  messageIndex: number
  handleNewChatMessage: (userTextFieldInput?: string, chatFilters?: AgentConfig) => void
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  setCurrentChat,
  currentChat,
  messageIndex,
  handleNewChatMessage,
}) => {
  if (message.role !== 'assistant') {
    throw new Error('Message is not an assistant message')
  }
  const { openContent } = useWindowContentContext()
  const { saveChat } = useChatContext()

  const { textParts, toolCalls } = extractMessagePartsFromAssistantMessage(message)

  const copyToClipboard = () => {
    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const createNewNoteFromMessage = async () => {
    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)
    const title = `${content.substring(0, 20)}...`
    openContent(title, content)
  }

  const executeToolCall = useCallback(
    async (toolCallPart: ToolCallPart) => {
      const existingToolResult = findToolResultMatchingToolCall(toolCallPart.toolCallId, currentChat.messages)
      if (existingToolResult) {
        toast.error('Tool call id already exists')
        return
      }
      const toolResult = await createToolResult(
        toolCallPart.toolName,
        toolCallPart.args as any,
        toolCallPart.toolCallId,
      )
      const toolMessage: CoreToolMessage = {
        role: 'tool',
        content: [toolResult],
      }

      setCurrentChat((prevChat) => {
        if (!prevChat) return prevChat
        const updatedMessages = [...prevChat.messages]
        const currentMessageIndex = updatedMessages.findIndex((msg) => msg === message)
        if (currentMessageIndex !== -1) {
          updatedMessages.splice(currentMessageIndex + 1, 0, toolMessage)
        } else {
          updatedMessages.push(toolMessage)
        }
        const updatedChat = {
          ...prevChat,
          messages: updatedMessages,
        }
        saveChat(updatedChat)
        return updatedChat
      })
    },
    [currentChat, setCurrentChat, saveChat, message],
  )

  const isLatestAssistantMessage = (index: number, messages: ReorChatMessage[]) => {
    return messages.slice(index + 1).every((msg) => msg.role !== 'assistant')
  }

  useEffect(() => {
    if (!isLatestAssistantMessage(messageIndex, currentChat.messages)) return
    toolCalls.forEach((toolCall) => {
      const existingToolCall = findToolResultMatchingToolCall(toolCall.toolCallId, currentChat.messages)
      const toolDefinition = currentChat.toolDefinitions.find((definition) => definition.name === toolCall.toolName)
      if (toolDefinition && toolDefinition.autoExecute && !existingToolCall) {
        executeToolCall(toolCall)
      }
    })
  }, [currentChat, currentChat.toolDefinitions, executeToolCall, toolCalls, messageIndex])

  useEffect(() => {
    if (!isLatestAssistantMessage(messageIndex, currentChat.messages)) return

    const shouldLLMRespondToToolResults =
      toolCalls.length > 0 &&
      toolCalls.every((toolCall) => {
        const existingToolResult = findToolResultMatchingToolCall(toolCall.toolCallId, currentChat.messages)
        const toolDefinition = currentChat.toolDefinitions.find((definition) => definition.name === toolCall.toolName)
        return existingToolResult && toolDefinition?.autoExecute
      })

    if (shouldLLMRespondToToolResults) {
      handleNewChatMessage()
    }
  }, [currentChat, currentChat.toolDefinitions, executeToolCall, toolCalls, messageIndex, handleNewChatMessage])

  const renderContent = () => {
    return (
      <>
        {textParts.map((text, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <MarkdownRenderer key={index} content={text} />
        ))}
        {toolCalls.map((toolCall) => (
          <ToolCallComponent
            key={toolCall.toolCallId}
            toolCallPart={toolCall}
            currentChat={currentChat}
            executeToolCall={executeToolCall}
          />
        ))}
      </>
    )
  }

  return (
    <div className={`w-full ${getClassNameBasedOnMessageRole(message)} mb-4 flex`}>
      <div className="w-full flex-col gap-1">
        <div className="flex grow flex-col ">
          {renderContent()}
          <div className="mt-2 flex">
            <div
              className="cursor-pointer items-center justify-center rounded p-1 hover:bg-neutral-700"
              onClick={copyToClipboard}
            >
              <FaRegCopy color="gray" size={16} className="text-gray-200" title="Copy" />
            </div>
            <div
              className="cursor-pointer items-center justify-center rounded p-1 hover:bg-neutral-700"
              onClick={createNewNoteFromMessage}
            >
              <HiOutlinePencilAlt color="gray" size={18} className="text-gray-200" title="New Note" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssistantMessage
