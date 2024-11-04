import React, { useState, useRef } from 'react'
import { PiPaperPlaneRight } from 'react-icons/pi'
import { LoadingState } from '../../lib/llm/types'
import FileAutocomplete from './FileAutocomplete'

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
}) => {
  const [showFileAutocomplete, setShowFileAutocomplete] = useState(false)
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getCaretCoordinates = (element: HTMLTextAreaElement) => {
    const { selectionStart, value } = element
    const textBeforeCaret = value.substring(0, selectionStart)

    // Create a hidden div with the same styling as textarea
    const mirror = document.createElement('div')
    mirror.style.cssText = window.getComputedStyle(element).cssText
    mirror.style.height = 'auto'
    mirror.style.position = 'absolute'
    mirror.style.visibility = 'hidden'
    mirror.style.whiteSpace = 'pre-wrap'
    document.body.appendChild(mirror)

    // Create a span for the text before caret
    const textNode = document.createTextNode(textBeforeCaret)
    const span = document.createElement('span')
    span.appendChild(textNode)
    mirror.appendChild(span)

    // Get coordinates
    const coordinates = {
      top: span.offsetTop + parseInt(window.getComputedStyle(element).lineHeight, 10) / 2,
      left: span.offsetLeft,
    }

    // Clean up
    document.body.removeChild(mirror)

    return coordinates
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (userTextFieldInput && !e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      handleSubmitNewMessage()
    } else if (e.key === '@') {
      const rect = e.currentTarget.getBoundingClientRect()
      const position = getCaretCoordinates(e.currentTarget)
      setAutocompletePosition({
        top: rect.top + position.top,
        left: rect.left + position.left,
      })
      setShowFileAutocomplete(true)
      // console.log('showFileAutocomplete', showFileAutocomplete)
    } else if (showFileAutocomplete && e.key === 'Escape') {
      setShowFileAutocomplete(false)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    setUserTextFieldInput(value)

    // Handle @ mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1 && lastAtIndex < value.length) {
      const searchText = value.slice(lastAtIndex + 1).split(/\s/)[0]
      setSearchTerm(searchText)
    } else {
      setShowFileAutocomplete(false)
    }

    // Adjust textarea height
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  const handleFileSelect = (filePath: string) => {
    const lastAtIndex = userTextFieldInput.lastIndexOf('@')
    const newValue = `${userTextFieldInput.slice(0, lastAtIndex)}@${filePath} ${userTextFieldInput.slice(
      lastAtIndex + searchTerm.length + 1,
    )}`

    setUserTextFieldInput(newValue)
    setShowFileAutocomplete(false)
  }

  return (
    <div className="flex h-titlebar w-full items-center justify-center p-10">
      <div className="relative bottom-5 flex w-full max-w-3xl">
        <div className="w-full rounded-lg border-2 border-solid border-neutral-700 p-3 focus-within:ring-1 focus-within:ring-[#8c8c8c]">
          <div className="flex h-full pr-8">
            <textarea
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              onChange={handleInput}
              value={userTextFieldInput}
              className="mr-2 max-h-[50px] w-full resize-none overflow-y-auto border-0 bg-transparent text-foreground focus:outline-none"
              placeholder="Type @ to reference files..."
              rows={1}
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
        <FileAutocomplete
          searchTerm={searchTerm}
          position={autocompletePosition}
          onSelect={handleFileSelect}
          visible={showFileAutocomplete}
        />
      </div>
    </div>
  )
}

export default ChatInput
