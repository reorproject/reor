import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { ReorChatMessage } from '../../../lib/llm/types'
import { getDisplayMessage } from '../../../lib/llm/chat'

interface UserMessageProps {
  message: ReorChatMessage
}

const UserMessage: React.FC<UserMessageProps> = ({ message }) => (
  <div className="mb-0 w-full flex-col gap-1">
    <div className="flex grow flex-col">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        className="max-w-[95%] break-words text-2xl font-bold text-neutral-400"
      >
        {getDisplayMessage(message)}
      </ReactMarkdown>
    </div>
  </div>
)

export default UserMessage
