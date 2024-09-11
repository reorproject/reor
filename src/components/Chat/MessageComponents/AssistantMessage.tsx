/* eslint-disable react/no-array-index-key */
import React from 'react'
import { HiOutlineClipboardCopy, HiOutlinePencilAlt } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { Chat, ReorChatMessage } from '../types'
import { getClassNameBasedOnMessageRole, getDisplayMessage } from '../utils'
import { TextPart, ToolCallPartComponent } from './ToolCalls'
import { useWindowContentContext } from '@/contexts/WindowContentContext'

interface AssistantMessageProps {
  message: ReorChatMessage
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat | undefined>>
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, setCurrentChat }) => {
  const { openContent } = useWindowContentContext()
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

  const renderContent = () => {
    if (typeof message.content === 'string') {
      return <TextPart text={getDisplayMessage(message) || ''} />
    }
    if (Array.isArray(message.content)) {
      return message.content.map((part, index) => {
        if ('text' in part) {
          return <TextPart key={index} text={part.text} />
        }
        if (part.type === 'tool-call') {
          return <ToolCallPartComponent key={index} part={part} setCurrentChat={setCurrentChat} />
        }
        return null
      })
    }
    return null
  }

  return (
    <div className={`w-full ${getClassNameBasedOnMessageRole(message)} mb-4 flex`}>
      <div className="relative items-start pl-4 pt-3">
        <img src="icon.png" style={{ width: '22px', height: '22px' }} alt="ReorImage" />
      </div>
      <div className="w-full flex-col gap-1">
        <div className="flex grow flex-col px-5 py-2.5">
          {renderContent()}
          <div className="mt-2 flex">
            <div
              className="cursor-pointer items-center justify-center rounded p-1 hover:bg-neutral-700"
              onClick={copyToClipboard}
            >
              <HiOutlineClipboardCopy color="gray" size={18} className="text-gray-200" title="Copy" />
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