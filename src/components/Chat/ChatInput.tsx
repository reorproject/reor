import React from 'react'

import { PiPaperPlaneRight } from 'react-icons/pi'
import { LoadingState } from '../../lib/llm/types'

interface ChatInputProps {
  userTextFieldInput: string
  setUserTextFieldInput: (value: string) => void
  handleSubmitNewMessage: () => void
  loadingState: LoadingState
}

const ChatInput: React.FC<ChatInputProps> = ({
  userTextFieldInput,
  setUserTextFieldInput,
  handleSubmitNewMessage,
  loadingState,
}) => (
  <div className="flex h-titlebar w-full items-center justify-center  p-10">
    <div className="  relative bottom-5 flex w-full max-w-3xl">
      <div className="w-full rounded-lg border-2 border-solid border-neutral-700 p-3 focus-within:ring-1 focus-within:ring-[#8c8c8c]">
        <div className="flex h-full pr-8">
          <textarea
            onKeyDown={(e) => {
              if (userTextFieldInput && !e.shiftKey && e.key === 'Enter') {
                e.preventDefault()
                handleSubmitNewMessage()
              }
            }}
            onChange={(e) => setUserTextFieldInput(e.target.value)}
            value={userTextFieldInput}
            className="mr-2 max-h-[50px] w-full resize-none overflow-y-auto border-0 bg-gray-300 focus:outline-none"
            name="Outlined"
            placeholder="Follow up..."
            rows={1}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0)',
              color: 'rgb(212 212 212)',
              border: 'none',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement // Prevent TS inferring type error
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 160)}px`
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <PiPaperPlaneRight
              color={userTextFieldInput && loadingState !== 'idle' ? 'white' : 'gray'}
              onClick={userTextFieldInput ? handleSubmitNewMessage : undefined}
              className={userTextFieldInput ? 'cursor-pointer' : ''}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default ChatInput
