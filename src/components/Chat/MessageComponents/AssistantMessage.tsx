import React, { useCallback, useMemo } from 'react'
import { HiOutlinePencilAlt } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { ToolCallPart } from 'ai'
import { FaRegCopy } from 'react-icons/fa'
import { YStack, Stack, Text } from 'tamagui'
import { Chat, ReorChatMessage } from '../../../lib/llm/types'
import { extractMessagePartsFromAssistantMessage, findToolResultMatchingToolCall } from '../../../lib/llm/chat'
import { ToolCallComponent } from './ToolCalls'
import { useContentContext } from '@/contexts/ContentContext'
import { useChatContext } from '@/contexts/ChatContext'
import MarkdownRenderer from '@/components/Common/MarkdownRenderer'
import { makeAndAddToolResultToMessages } from '../../../lib/llm/tools/utils'

interface AssistantMessageProps {
  message: ReorChatMessage
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
  currentChat: Chat
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, setCurrentChat, currentChat }) => {
  if (message.role !== 'assistant') {
    throw new Error('Message is not an assistant message')
  }
  const { openContent } = useContentContext()
  const { saveChat } = useChatContext()

  const { textParts, toolCalls } = useMemo(() => {
    return extractMessagePartsFromAssistantMessage(message)
  }, [message])

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

      const updatedMessages = await makeAndAddToolResultToMessages(currentChat.messages, toolCallPart, message)

      setCurrentChat((prevChat) => {
        if (!prevChat) return prevChat
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

  const renderContent = () => {
    return (
      <>
        {textParts.map((text, index) => (
          <Stack>
            <Stack>
              <Text color="$color11">
                {/* eslint-disable-next-line react/no-array-index-key */}
                <MarkdownRenderer key={index} content={text} />
              </Text>
            </Stack>
            <div className="mt-0 flex">
              <YStack
                hoverStyle={{
                  backgroundColor: '$gray7',
                }}
                cursor="pointer"
                alignItems="center"
                justifyContent="center"
                px={4}
                borderRadius="$1"
                onPress={copyToClipboard}
              >
                <FaRegCopy color="gray" size={16} className="text-gray-200" title="Copy" />
              </YStack>
              <YStack
                hoverStyle={{
                  backgroundColor: '$gray7',
                }}
                cursor="pointer"
                alignContent="center"
                justifyContent="center"
                px={4}
                borderRadius="$1"
                onPress={createNewNoteFromMessage}
              >
                <HiOutlinePencilAlt color="gray" size={18} className="text-gray-200" title="New Note" />
              </YStack>
            </div>
          </Stack>
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
    <Stack marginBottom={7} width="100%">
      <YStack flex={1}>{renderContent()}</YStack>
    </Stack>
  )
}

export default AssistantMessage
