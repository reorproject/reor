import React, { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import TextField from '@mui/material/TextField'
import { ReorChatMessage } from '../../lib/llm/types'
import { convertMessageToString } from '../../lib/llm/chat'

interface ConversationHistoryProps {
  history: ReorChatMessage[]
  streamingMessage: string
  markdownMaxHeight: string | number
  customPrompt: string
  setCustomPrompt: (value: string) => void
  handleCustomPrompt: () => void
  displayPrompt: string
  currentIndex: number
  onNavigate: (direction: 'prev' | 'next') => void
  getLLMResponse: (prompt: string) => void
  insertAfterHighlightedText: () => void
  copyToClipboard: () => void
  replaceHighlightedText: () => void
  isNewConversation: boolean
  // prompts: { option?: string; customPromptInput?: string }[]
  loadingResponse: boolean
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  history,
  streamingMessage,
  markdownMaxHeight,
  customPrompt,
  setCustomPrompt,
  handleCustomPrompt,
  displayPrompt,
  currentIndex,
  onNavigate,
  getLLMResponse,
  insertAfterHighlightedText,
  copyToClipboard,
  replaceHighlightedText,
  isNewConversation,
  // prompts,
  loadingResponse,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  // const [currentPrompt, setCurrentPrompt] = useState<{ option?: string; customPromptInput?: string }>({})

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, streamingMessage, currentIndex])

  // useEffect(() => {
  //   setCurrentPrompt(prompts[currentIndex / 2])
  //   bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  // }, [prompts, currentIndex])

  const currentConversation = isNewConversation
    ? [history[history.length - 1]]
    : history.slice(currentIndex, currentIndex + 2)

  return (
    <div className="mt-4 flex flex-col" style={{ maxHeight: markdownMaxHeight }}>
      <div className="mb-2 flex justify-between">
        <button
          onClick={() => onNavigate('prev')}
          disabled={currentIndex === 0 || isNewConversation}
          className="rounded bg-gray-200 px-2 py-1"
          type="button"
        >
          Previous
        </button>
        <button
          onClick={() => onNavigate('next')}
          disabled={currentIndex >= history.length - 2 || isNewConversation}
          className="rounded bg-gray-200 px-2 py-1"
          type="button"
        >
          Next
        </button>
      </div>
      <div className="grow overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-gray-400">
        {currentConversation.map(
          (message) =>
            message.role === 'assistant' && (
              <div className="mb-2 rounded-md bg-gray-500 p-2">
                <ReactMarkdown rehypePlugins={[rehypeRaw]} className="markdown-content break-words">
                  {convertMessageToString(message)}
                </ReactMarkdown>
              </div>
            ),
        )}
        {streamingMessage && (
          <div className="mb-2 rounded-md bg-gray-500 p-2">
            <ReactMarkdown rehypePlugins={[rehypeRaw]} className="markdown-content break-words">
              {streamingMessage}
            </ReactMarkdown>
          </div>
        )}
        {!streamingMessage && loadingResponse && (
          <div className="mb-2 rounded-md bg-gray-300 p-2 italic text-gray-600">Generating response...</div>
        )}
        <div ref={bottomRef} />
      </div>
      <TextField
        type="text"
        variant="outlined"
        size="small"
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        placeholder="Follow up..."
        className="mt-2 w-full p-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleCustomPrompt()
            setCustomPrompt('') // Clear the TextField after submitting
          }
        }}
      />
      <div className="mt-2 flex justify-between">
        <button
          className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
          onClick={() => getLLMResponse(displayPrompt)}
          type="button"
        >
          Re-run
        </button>
        <button
          className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
          onClick={insertAfterHighlightedText}
          type="button"
        >
          Insert
        </button>
        <button
          className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
          onClick={copyToClipboard}
          type="button"
        >
          Copy
        </button>
        <button
          className="flex cursor-pointer items-center rounded-md border-0 bg-indigo-700 px-2.5 py-1 text-white"
          onClick={replaceHighlightedText}
          type="button"
        >
          Replace
        </button>
      </div>
    </div>
  )
}

export default ConversationHistory
