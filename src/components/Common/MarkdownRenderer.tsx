/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/heading-has-content */
import React from 'react'
import ReactMarkdown from 'react-markdown'

const customComponents = {
  h1: ({ ...props }: React.ComponentPropsWithoutRef<'h1'>) => <h1 className="my-4 text-2xl font-bold" {...props} />,
  h2: ({ ...props }: React.ComponentPropsWithoutRef<'h2'>) => <h2 className="my-3 text-xl font-semibold" {...props} />,
  h3: ({ ...props }: React.ComponentPropsWithoutRef<'h3'>) => <h3 className="my-2 text-lg font-medium" {...props} />,
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      className="overflow-hidden whitespace-normal break-words text-muted-foreground"
      components={customComponents}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
