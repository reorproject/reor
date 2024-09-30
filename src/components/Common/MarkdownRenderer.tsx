import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

interface MarkdownRendererProps {
  content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className="overflow-hidden whitespace-normal break-words text-muted-foreground"
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
