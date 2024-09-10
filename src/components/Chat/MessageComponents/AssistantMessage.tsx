import React from 'react'
import { HiOutlineClipboardCopy, HiOutlinePencilAlt } from 'react-icons/hi'
import { toast } from 'react-toastify'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { ReorChatMessage } from '../types'
import { getClassNameBasedOnMessageRole, getDisplayMessage } from '../utils'

interface AssistantMessageProps {
  message: ReorChatMessage
  openTabContent: (title: string, content: string | undefined) => void
}

const AssistantMessage: React.FC<AssistantMessageProps> = ({ message, openTabContent }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(getDisplayMessage(message) ?? '')
    toast.success('Copied to clipboard!')
  }

  const createNewNoteFromMessage = async () => {
    const title = `${(getDisplayMessage(message) ?? `${new Date().toDateString()}`).substring(0, 20)}...`
    openTabContent(title, getDisplayMessage(message))
  }

  return (
    <div className={`w-full ${getClassNameBasedOnMessageRole(message)} mb-4 flex`}>
      <div className="relative items-start pl-4 pt-3">
        <img src="icon.png" style={{ width: '22px', height: '22px' }} alt="ReorImage" />
      </div>
      <div className="w-full flex-col gap-1">
        <div className="flex grow flex-col px-5 py-2.5">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} className="max-w-[95%] break-words">
            {getDisplayMessage(message)}
          </ReactMarkdown>
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
