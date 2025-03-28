import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import { useTheme } from 'tamagui'

interface MarkdownRendererProps {
  content: string
}

// Wrapper to ReactMarkdown with useTheme for dynamic themeing
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className={`overflow-hidden whitespace-normal break-words text-sm leading-relaxed text-muted-foreground`}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
