/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArrowUp } from 'lucide-react'
import React, { useState } from 'react'
import { streamText } from 'ai'
import { Button } from '../ui/button'
import resolveLLMClient from '@/lib/llm/client'

interface AiEditMenuProps {
  selectedText: string
  onEdit: (newText: string) => void
}

const AiEditMenu = ({ selectedText, onEdit }: AiEditMenuProps) => {
  const [response, setResponse] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = async () => {
    try {
      setIsLoading(true)
      setResponse('')
      const defaultLLMName = await window.llm.getDefaultLLMName()
      const llmClient = await resolveLLMClient(defaultLLMName)
      const { textStream } = await streamText({
        model: llmClient,
        messages: [{ role: 'user', content: `Edit the following text: ${selectedText}` }],
      })

      // eslint-disable-next-line no-restricted-syntax
      for await (const textPart of textStream) {
        setResponse((prev) => prev + textPart)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {(response || isLoading) && (
        <div className="relative rounded-md border border-border bg-background/95 p-3 text-sm text-foreground shadow-lg backdrop-blur">
          {isLoading && !response && <div className="animate-pulse text-muted-foreground">Generating response...</div>}
          {response && (
            <div className="prose prose-invert max-w-none">
              <p className="m-0">{response}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className="z-50 flex w-full flex-col overflow-hidden rounded border-2 border-solid border-border bg-background text-white focus-within:ring-1 focus-within:ring-ring"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
        <Button
          onClick={handleEdit}
          size="icon"
          variant="ghost"
          className="text-purple-500 hover:bg-purple-500/10"
          disabled={isLoading}
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>
    </div>
  )
}

export default AiEditMenu
