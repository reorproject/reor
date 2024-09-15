import React from 'react'
import ReactMarkdown from 'react-markdown'
// eslint-disable-next-line jsx-a11y/heading-has-content, react/jsx-props-no-spreading
const CustomH1 = (props: React.ComponentPropsWithoutRef<'h1'>) => <h1 className="leading-relaxed" {...props} />

const CustomPre = (props: React.ComponentPropsWithoutRef<'pre'>) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <pre className="whitespace-pre-wrap break-all" {...props} />
)

const CustomCode = (props: React.ComponentPropsWithoutRef<'code'>) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <code className="whitespace-pre-wrap break-all" {...props} />
)

interface MarkdownRendererProps {
  content: string
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      className="break-all"
      components={{
        h1: CustomH1,
        pre: CustomPre,
        code: CustomCode,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
