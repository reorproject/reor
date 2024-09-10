import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { ReorChatMessage } from '../types'
import { getClassNameBasedOnMessageRole, getDisplayMessage } from '../utils'

interface SystemMessageProps {
  message: ReorChatMessage
}

const SystemMessage: React.FC<SystemMessageProps> = ({ message }) => (
  <div className={`w-full ${getClassNameBasedOnMessageRole(message)} mb-4 flex`}>
    <div className="w-full flex-col gap-1">
      <div className="flex grow flex-col px-5 py-2.5">
        <ReactMarkdown rehypePlugins={[rehypeRaw]} className="max-w-[95%] break-words">
          {getDisplayMessage(message)}
        </ReactMarkdown>
      </div>
    </div>
  </div>
)

export default SystemMessage
