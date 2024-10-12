import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { ReorChatMessage } from '../../lib/llm/types'
import { convertMessageToString } from '../../lib/llm/chat'

interface ConversationHistoryProps {
  history: ReorChatMessage[]
  streamingMessage: string
  markdownMaxHeight: string | number
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ history, streamingMessage, markdownMaxHeight }) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, streamingMessage])

  return (
    <div className="mt-4 overflow-y-auto" style={{ maxHeight: markdownMaxHeight }}>
      {history.map((message) => (
        <div className={`mb-2 rounded-md p-2 ${message.role === 'user' ? 'bg-blue-500' : 'bg-gray-500'}`}>
          <p className="font-bold">{message.role === 'user' ? 'You' : 'Assistant'}:</p>
          <ReactMarkdown rehypePlugins={[rehypeRaw]} className="markdown-content break-words">
            {convertMessageToString(message)}
          </ReactMarkdown>
        </div>
      ))}
      {streamingMessage && (
        <div className="mb-2 rounded-md bg-gray-500 p-2">
          <p className="font-bold">Assistant:</p>
          <ReactMarkdown rehypePlugins={[rehypeRaw]} className="markdown-content break-words">
            {streamingMessage}
          </ReactMarkdown>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  )
}

export default ConversationHistory
