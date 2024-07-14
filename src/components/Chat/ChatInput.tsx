import React from 'react'

import Textarea from '@mui/joy/Textarea'
import { CircularProgress } from '@mui/material'

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
  <div className="border-0 border-t-[0.001px] border-solid border-neutral-700 bg-transparent p-3">
    <div className="flex h-full">
      <Textarea
        onKeyDown={(e) => {
          if (!e.shiftKey && e.key === 'Enter') {
            e.preventDefault()
            handleSubmitNewMessage()
          }
        }}
        onChange={(e) => setUserTextFieldInput(e.target.value)}
        value={userTextFieldInput}
        className="mr-2 w-full bg-gray-300"
        name="Outlined"
        placeholder="Type here to ask your notes..."
        variant="outlined"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0)',
          color: 'rgb(212 212 212)',
          border: 'none',
        }}
      />
      <div className="flex h-full items-center justify-center">
        {loadingResponse ? (
          <CircularProgress size={32} thickness={20} style={{ color: 'rgb(209 213 219 / var(--tw-bg-opacity))' }} />
        ) : (
          <button
            aria-expanded="false"
            aria-haspopup="menu"
            className={`h-full w-[85px] cursor-pointer select-none rounded border-none
                  bg-neutral-700 px-2  py-0  text-center align-middle
                  font-sans text-xs font-bold text-white shadow-md
                  shadow-gray-900/10 transition-all hover:bg-neutral-900 hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-85 focus:shadow-none
                  active:opacity-85 active:shadow-none`}
            type="button"
            onClick={() => handleSubmitNewMessage()}
          >
            {askText}
          </button>
        )}
      </div>
    </div>
  </div>
)

export default ChatInput
