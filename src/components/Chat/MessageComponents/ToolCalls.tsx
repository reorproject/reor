import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface TextPartProps {
  text: string
}

export const TextPart: React.FC<TextPartProps> = ({ text }) => (
  <ReactMarkdown rehypePlugins={[rehypeRaw]} className="max-w-[95%] break-words">
    {text}
  </ReactMarkdown>
)

interface ToolCallPartProps {
  toolCallId: string
  toolName: string
  args: unknown
}

export const ToolCallPart: React.FC<ToolCallPartProps> = ({ toolCallId, toolName, args }) => (
  <div className="mt-2 rounded border border-gray-300 p-2">
    <h4 className="font-bold">Tool Call: {toolName}</h4>
    <p>ID: {toolCallId}</p>
    <pre className="mt-2 overflow-x-auto bg-gray-100 p-2">
      <code>{JSON.stringify(args, null, 2)}</code>
    </pre>
  </div>
)
