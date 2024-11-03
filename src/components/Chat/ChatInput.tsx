import React from 'react'

import { PiPaperPlaneRight } from 'react-icons/pi'
import { LoadingState } from '../../lib/llm/types'
import { Button } from '../ui/button'
import LLMSelectOrButton from '../Settings/LLMSettings/LLMSelectOrButton'

interface ChatInputProps {
  userTextFieldInput: string
  setUserTextFieldInput: (value: string) => void
  handleSubmitNewMessage: () => void
  loadingState: LoadingState
  selectedLLM: string | undefined
  setSelectedLLM: (value: string | undefined) => void
}

const ChatInput: React.FC<ChatInputProps> = ({
  userTextFieldInput,
  setUserTextFieldInput,
  handleSubmitNewMessage,
  loadingState,
  selectedLLM,
  setSelectedLLM,
}) => (
  <div className=" flex w-full ">
    <div className="z-50 flex w-full flex-col overflow-hidden rounded border-2 border-solid border-border bg-background focus-within:ring-1 focus-within:ring-ring">
      <textarea
        value={userTextFieldInput}
        onKeyDown={(e) => {
          if (!e.shiftKey && e.key === 'Enter') {
            e.preventDefault()
            handleSubmitNewMessage()
          }
        }}
        className="h-[100px] w-full resize-none border-0 bg-transparent p-4 text-foreground caret-current focus:outline-none"
        wrap="soft"
        placeholder="What can Reor help you with today?"
        onChange={(e) => setUserTextFieldInput(e.target.value)}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <div className="mx-auto h-px w-[96%] bg-background/20" />
      <div className="flex h-10 flex-col items-center justify-between gap-2  py-2 md:flex-row md:gap-4">
        <div className="flex flex-col items-center justify-between rounded-md border-0 py-2 md:flex-row">
          <LLMSelectOrButton selectedLLM={selectedLLM} setSelectedLLM={setSelectedLLM} />
        </div>
        <div className="flex items-center">
          <Button
            className="m-2 flex items-center justify-between gap-2 bg-transparent text-primary hover:bg-transparent hover:text-accent-foreground"
            onClick={handleSubmitNewMessage}
            disabled={loadingState !== 'idle'}
          >
            <PiPaperPlaneRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
)

export default ChatInput
