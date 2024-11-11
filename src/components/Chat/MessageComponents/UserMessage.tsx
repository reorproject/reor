import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { ReorChatMessage } from '../../../lib/llm/types'
import { getDisplayMessage } from '../../../lib/llm/chat'

interface UserMessageProps {
  message: ReorChatMessage
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const displayMessage = getDisplayMessage(message)
  const messageLength = displayMessage?.length || 0

  // Determine font size class based on message length
  const getFontSizeClass = () => {
    if (messageLength > 100) return 'text-lg'
    if (messageLength > 50) return 'text-xl'
    return 'text-2xl'
  }

  return (
    <div className="mb-0 w-full flex-col gap-1">
      <div className="flex grow flex-col">
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]}
          className={`max-w-[95%] break-words font-bold text-neutral-400 ${getFontSizeClass()}`}
        >
          {displayMessage}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default UserMessage
