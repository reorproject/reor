import React, { useRef, useState } from 'react'
import { PiPaperPlaneRight } from 'react-icons/pi'
import FileAutocomplete from './FileAutocomplete'
import { AgentConfig, LoadingState } from '../../lib/llm/types'
import { Button } from '../ui/button'
import LLMSelectOrButton from '../Settings/LLMSettings/LLMSelectOrButton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface ChatInputProps {
  userTextFieldInput: string
  setUserTextFieldInput: (value: string) => void
  handleSubmitNewMessage: () => void
  loadingState: LoadingState
  selectedLLM: string | undefined
  setSelectedLLM: (value: string | undefined) => void
  agentConfig: AgentConfig | undefined
  setAgentConfig: React.Dispatch<React.SetStateAction<AgentConfig | undefined>>
}

const ChatInput: React.FC<ChatInputProps> = ({
  userTextFieldInput,
  setUserTextFieldInput,
  handleSubmitNewMessage,
  loadingState,
  selectedLLM,
  setSelectedLLM,
  agentConfig,
  setAgentConfig,
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

  // const [useStream, setUseStream] = React.useState(true)

  const handleDbSearchToggle = (checked: boolean) => {
    setAgentConfig((prevConfig) => {
      if (!prevConfig) throw new Error('Agent config must be initialized before setting db search filters')
      return {
        ...prevConfig,
        dbSearchFilters: checked
          ? {
              limit: 22,
              minDate: undefined,
              maxDate: undefined,
              passFullNoteIntoContext: true,
            }
          : undefined,
      }
    })
  }

  return (
    <div className="flex w-full">
      <div className="relative z-50 flex w-full flex-col overflow-visible rounded border-2 border-solid border-border bg-background focus-within:ring-1 focus-within:ring-ring">
        {/* <Select value={selectedLLM}>
          <SelectTrigger className="h-7 w-32 border-0 text-[10px] text-gray-300 focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Tools" />
          </SelectTrigger>
          <SelectContent className="rounded-md border border-dark-gray-c-eight bg-[#1c1c1c]">
            {allAvailableToolDefinitions.map((tool) => (
              <SelectItem
                key={tool.displayName}
                value={tool.name}
                className="cursor-pointer text-[10px] text-gray-300 hover:bg-[#252525] focus:bg-[#252525] focus:text-gray-200"
              >
                {tool.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
        <textarea
          ref={textareaRef}
          value={userTextFieldInput}
          onKeyDown={(e) => {
            handleKeyDown(e)
            if (!e.shiftKey && e.key === 'Enter') {
              e.preventDefault()
              handleSubmitNewMessage()
            }
          }}
          onChange={(e) => {
            handleInput(e)
            setUserTextFieldInput(e.target.value)
          }}
          className="min-h-[100px] w-full resize-none border-0 bg-transparent p-4 text-foreground caret-current focus:outline-none"
          wrap="soft"
          placeholder="What can Reor help you with today?"
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          // rows={1}
        />
        <div className="mx-auto h-px w-[96%] bg-background/20" />
        <div className="flex h-10 flex-col items-center justify-between gap-2  py-2 md:flex-row md:gap-4">
          <div className="flex flex-col items-center justify-between rounded-md border-0 py-2 md:flex-row">
            <LLMSelectOrButton selectedLLM={selectedLLM} setSelectedLLM={setSelectedLLM} />
          </div>

          <div className="flex items-center">
            <div className="mr-[-8px] flex flex-col">
              <Switch
                id="search-notes"
                checked={!!agentConfig?.dbSearchFilters}
                onCheckedChange={handleDbSearchToggle}
                className="scale-[0.6]"
              />
              <Label htmlFor="stream-mode" className="mt-0 text-[8px] text-muted-foreground">
                Search notes
              </Label>
            </div>

            <Button
              className="flex items-center justify-between bg-transparent text-[10px] text-primary hover:bg-transparent hover:text-accent-foreground"
              onClick={handleSubmitNewMessage}
              disabled={loadingState !== 'idle'}
            >
              <PiPaperPlaneRight className="size-4" />
            </Button>
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
