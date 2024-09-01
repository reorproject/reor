import React, { MutableRefObject, useState } from 'react'
import { HiOutlineClipboardCopy, HiOutlinePencilAlt } from 'react-icons/hi'
import { toast } from 'react-toastify'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { FaRegUserCircle } from 'react-icons/fa'
import '../../styles/chat.css'
import { Chat, ChatFilters, ReorChatMessage } from './types'
import { useTabsContext } from '@/contexts/TabContext'
import ChatInput from './ChatInput'
import { getClassNameBasedOnMessageRole, getDisplayMessage } from './utils'
import LoadingDots from '@/utils/animations'

interface ChatMessagesProps {
  currentChatHistory: Chat | undefined
  chatContainerRef: MutableRefObject<HTMLDivElement | null>
  loadAnimation: boolean
  handleNewChatMessage: (userTextFieldInput: string | undefined, chatFilters?: ChatFilters) => void
  loadingResponse: boolean
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  currentChatHistory,
  chatContainerRef,
  handleNewChatMessage,
  loadAnimation,
  loadingResponse,
}) => {
  const { openTabContent } = useTabsContext()
  const [userTextFieldInput, setUserTextFieldInput] = useState<string | undefined>()

  const copyToClipboard = (message: ReorChatMessage) => {
    navigator.clipboard.writeText(getDisplayMessage(message) ?? '')
    toast.success('Copied to clipboard!')
  }

  const createNewNoteFromMessage = async (message: ReorChatMessage) => {
    const title = `${(getDisplayMessage(message) ?? `${new Date().toDateString()}`).substring(0, 20)}...`
    openTabContent(title, getDisplayMessage(message))
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={chatContainerRef} className="grow overflow-auto">
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="w-full max-w-3xl">
            {currentChatHistory &&
              currentChatHistory.messages &&
              currentChatHistory.messages.length > 0 &&
              currentChatHistory.messages
                .filter((msg) => msg.role !== 'system')
                .map((message, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index} className={`w-full ${getClassNameBasedOnMessageRole(message)} mb-4 flex`}>
                    <div className="relative items-start pl-4 pt-3">
                      {message.role === 'user' ? (
                        <FaRegUserCircle size={22} />
                      ) : (
                        <img src="icon.png" style={{ width: '22px', height: '22px' }} alt="ReorImage" />
                      )}
                    </div>
                    <div className="w-full flex-col gap-1">
                      <div className="flex grow flex-col px-5 py-2.5">
                        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="max-w-[95%] break-words">
                          {getDisplayMessage(message)}
                        </ReactMarkdown>
                        {message.role === 'assistant' && (
                          <div className="mt-2 flex">
                            <div
                              className="cursor-pointer items-center justify-center rounded p-1 hover:bg-neutral-700"
                              onClick={() => copyToClipboard(message)}
                            >
                              <HiOutlineClipboardCopy color="gray" size={18} className="text-gray-200" title="Copy" />
                            </div>
                            <div
                              className="cursor-pointer items-center justify-center rounded p-1 hover:bg-neutral-700"
                              onClick={() => createNewNoteFromMessage(message)}
                            >
                              <HiOutlinePencilAlt color="gray" size={18} className="text-gray-200" title="New Note" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {loadAnimation && (
            <div className="mt-4 flex w-full max-w-3xl items-start gap-6">
              <img src="icon.png" style={{ width: '22px', height: '22px' }} alt="ReorImage" />
              <LoadingDots />
            </div>
          )}
        </div>
      </div>

      {currentChatHistory && (
        <div className="w-full p-4">
          <ChatInput
            userTextFieldInput={userTextFieldInput ?? ''}
            setUserTextFieldInput={setUserTextFieldInput}
            handleSubmitNewMessage={() => {
              handleNewChatMessage(userTextFieldInput)
            }}
            loadingResponse={loadingResponse}
          />
        </div>
      )}
    </div>
  )
}

export default ChatMessages
