import React from 'react'

import { PiPaperPlaneRight } from 'react-icons/pi'
import { MdOutlinePause } from "react-icons/md";

interface ChatInputProps {
  userTextFieldInput: string
  setUserTextFieldInput: (value: string) => void
  handleSubmitNewMessage: () => void
  loadingResponse: boolean
  askText: string
}

const ChatInput: React.FC<ChatInputProps> = ({
  userTextFieldInput,
  setUserTextFieldInput,
  handleSubmitNewMessage,
  loadingResponse,
  askText,
}) => (
  <div className="relative w-full h-titlebar p-10 flex items-center justify-center bg-dark-gray-c-eleven">
    <div className="fixed bottom-5 relative flex w-full max-w-3xl">
      <div className="border-1 w-full rounded-lg border-solid border-neutral-700 p-3">
        <div className="relative flex h-full">
          <textarea
            onKeyDown={(e) => {
              if (userTextFieldInput && !e.shiftKey && e.key === 'Enter') {
                e.preventDefault();
                handleSubmitNewMessage();
              }
            }}
            onChange={(e) => setUserTextFieldInput(e.target.value)}
            value={userTextFieldInput}
            className="mr-2 w-full border-0 bg-gray-300 focus:outline-none resize-none overflow-y-auto max-h-[100px]"
            name="Outlined"
            placeholder="Type here to ask your notes..."
            rows={1}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0)',
              color: 'rgb(212 212 212)',
              border: 'none',
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
            }}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {!loadingResponse ? (
              <PiPaperPlaneRight
                color={userTextFieldInput ? 'white' : 'gray'}
                onClick={userTextFieldInput ? handleSubmitNewMessage : undefined}
                className={userTextFieldInput ? 'cursor-pointer' : ''}
              />
            ) : (
              <MdOutlinePause color="white" className="cursor-pointer" />
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default ChatInput
