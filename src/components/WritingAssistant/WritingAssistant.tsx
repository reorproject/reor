import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { FaMagic } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import posthog from 'posthog-js'
import { streamText } from 'ai'
import { appendStringContentToMessages, convertMessageToString } from '../Chat/utils/utils'
import useOutsideClick from './hooks/use-outside-click'
import getClassNames, { generatePromptString, getLastMessage } from './utils'
import { ReorChatMessage } from '../Chat/utils/types'
import { useFileContext } from '@/contexts/FileContext'
import resolveLLMClient from '@/utils/llm'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const WritingAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ReorChatMessage[]>([])
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)
  const [customPrompt, setCustomPrompt] = useState<string>('')
  const [isOptionsVisible, setIsOptionsVisible] = useState<boolean>(false)
  const [prevPrompt, setPrevPrompt] = useState<string>('')
  const [positionStyle, setPositionStyle] = useState({ top: 0, left: 0 })
  const [markdownMaxHeight, setMarkdownMaxHeight] = useState('auto')
  const [isSpaceTrigger, setIsSpaceTrigger] = useState<boolean>(false)
  const [spacePosition, setSpacePosition] = useState<number | null>(null)
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const markdownContainerRef = useRef<HTMLDivElement>(null)
  const optionsContainerRef = useRef<HTMLDivElement>(null)
  const textFieldRef = useRef<HTMLInputElement>(null)
  const lastAssistantMessage = getLastMessage(messages, 'assistant')
  const hasValidMessages = !!lastAssistantMessage

  const { editor, highlightData } = useFileContext()

  useOutsideClick(markdownContainerRef, () => {
    setMessages([])
    setIsSpaceTrigger(false)
    setCustomPrompt('')
  })
  useOutsideClick(optionsContainerRef, () => {
    setIsOptionsVisible(false)
    setIsSpaceTrigger(false)
    setCustomPrompt('')
  })

  useEffect(() => {
    if (hasValidMessages) {
      setIsOptionsVisible(false)
    }
  }, [hasValidMessages])

  useLayoutEffect(() => {
    if (!editor || (!isSpaceTrigger && !highlightData)) return
    const calculatePosition = () => {
      if (!optionsContainerRef.current) return
      const { from } = editor.state.selection
      const coords = editor.view.coordsAtPos(from)
      const viewportHeight = window.innerHeight
      const optionsHeight = 200
      const spaceBelow = viewportHeight - coords.bottom

      let top = 0
      let left = 0
      if (spaceBelow >= optionsHeight) {
        // Enough space below, position under the cursor

        left = coords.left - 50
        top = coords.bottom - 50
      } else if (spaceBelow < optionsHeight) {
        // Not enough space below, position above the cursor

        left = coords.left - 100
        top = coords.top - optionsHeight
      }

      setPositionStyle({
        top,
        left,
      })
    }

    calculatePosition()
  }, [isSpaceTrigger, highlightData, editor, isOptionsVisible])

  useLayoutEffect(() => {
    if (hasValidMessages) {
      const calculateMaxHeight = () => {
        if (!markdownContainerRef.current) return

        const screenHeight = window.innerHeight
        const containerTop = positionStyle.top
        const buttonHeight = 30
        const padding = 54
        const availableHeight = screenHeight - containerTop - buttonHeight - padding

        setMarkdownMaxHeight(`${availableHeight}px`)
      }

      calculateMaxHeight()
      window.addEventListener('resize', calculateMaxHeight)

      return () => window.removeEventListener('resize', calculateMaxHeight)
    }
    return () => {}
  }, [hasValidMessages, positionStyle.top])

  useEffect(() => {
    if (editor) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === ' ') {
          const { from } = editor.state.selection
          const $from = editor.state.doc.resolve(from)
          const start = $from.start()
          const lineText = editor.state.doc.textBetween(start, from, '\n', '\n')

          if (lineText.trim() === '' && from === start) {
            event.preventDefault()
            setCursorPosition(from)

            setIsSpaceTrigger(true)
            setIsOptionsVisible(true)
            setSpacePosition(from)
          }
        }
      }

      editor.view.dom.addEventListener('keydown', handleKeyDown)

      return () => {
        editor.view.dom.removeEventListener('keydown', handleKeyDown)
      }
    }

    return () => {}
  }, [editor])

  useEffect(() => {
    if (editor && isSpaceTrigger && spacePosition !== null) {
      const checkSpacePresence = () => {
        const currentContent = editor.state.doc.textBetween(spacePosition, spacePosition + 1)
        if (currentContent !== ' ') {
          setIsOptionsVisible(false)
          setIsSpaceTrigger(false)
          setSpacePosition(null)
        }
      }

      editor.on('update', checkSpacePresence)

      return () => {
        editor.off('update', checkSpacePresence)
      }
    }
    return () => {}
  }, [editor, isSpaceTrigger, spacePosition])

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOptionsVisible(false)
        setIsSpaceTrigger(false)
        setCustomPrompt('')
        setMessages([])

        // Return focus to the editor and set cursor position
        if (editor && cursorPosition !== null) {
          editor.commands.focus()
          editor.commands.setTextSelection(cursorPosition)
        }
      }
    }

    document.addEventListener('keydown', handleEscKey)

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [editor, cursorPosition])

  const copyToClipboard = () => {
    const lastMessage = getLastMessage(messages, 'assistant')
    if (!lastMessage) return

    const copiedText = lastMessage.visibleContent ? lastMessage.visibleContent : lastMessage.content

    if (copiedText && typeof copiedText === 'string') navigator.clipboard.writeText(copiedText)
  }

  const insertAfterHighlightedText = () => {
    const lastMessage = getLastMessage(messages, 'assistant')
    if (!lastMessage || !editor) return

    const insertionText = lastMessage.visibleContent ? lastMessage.visibleContent : lastMessage.content

    editor.view.focus()

    const { from, to } = editor.state.selection
    const endOfSelection = Math.max(from, to)

    editor.chain().focus().setTextSelection(endOfSelection).insertContent(`\n${insertionText}`).run()

    setMessages([])
    setCustomPrompt('')
  }

  const replaceHighlightedText = () => {
    const lastMessage = getLastMessage(messages, 'assistant')
    if (!lastMessage || !editor) return
    const replacementText = lastMessage.visibleContent ? lastMessage.visibleContent : lastMessage.content

    if (replacementText) {
      editor.chain().focus().deleteSelection().insertContent(replacementText).run()
    }

    setMessages([])
    setCustomPrompt('')
  }

  const getLLMResponse = async (prompt: string) => {
    const defaultLLMName = await window.llm.getDefaultLLMName()

    if (loadingResponse) return
    setLoadingResponse(true)
    posthog.capture('submitted_writing_assistant_message')

    const { textStream } = await streamText({
      model: await resolveLLMClient(defaultLLMName),
      // messages: newChatHistory.messages,
      prompt,
    })

    let updatedMessages = messages
    // eslint-disable-next-line no-restricted-syntax
    for await (const textPart of textStream) {
      updatedMessages = appendStringContentToMessages(updatedMessages, textPart)
      setMessages(updatedMessages)
    }

    setLoadingResponse(false)
  }

  const handleOption = async (option: string, customPromptInput?: string) => {
    const selectedText = highlightData.text
    const prompt = generatePromptString(option, selectedText, isSpaceTrigger, customPromptInput)
    setPrevPrompt(prompt)
    await getLLMResponse(prompt)
  }

  if (!isSpaceTrigger && !highlightData.position) return null
  if (isSpaceTrigger && isOptionsVisible && !getLastMessage(messages, 'assistant'))
    return (
      <div
        ref={optionsContainerRef}
        style={{
          top: positionStyle.top,
          left: positionStyle.left,
        }}
        className="absolute z-50 w-96 rounded-md border border-gray-300 bg-white p-2.5"
      >
        <TextField
          inputRef={textFieldRef}
          autoFocus
          type="text"
          variant="outlined"
          size="small"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ask AI anything..."
          className="mb-2.5 w-full p-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleOption('custom', customPrompt)
            }
          }}
        />
        <div className="max-h-36 overflow-y-auto">
          <Button
            onClick={() => handleOption('simplify')}
            className="mb-1 block w-full"
            style={{ textTransform: 'none' }}
          >
            Simplify and condense the writing
          </Button>
          <Button
            onClick={() => handleOption('copy-editor')}
            className="mb-1 block w-full"
            style={{ textTransform: 'none' }}
          >
            Fix spelling and grammar
          </Button>
          <Button
            onClick={() => handleOption('takeaways')}
            className="mb-1 block w-full"
            style={{ textTransform: 'none' }}
          >
            List key Takeaways
          </Button>
        </div>
      </div>
    )
  return (
    <div>
      {!isSpaceTrigger && highlightData.position && (
        <Popover>
          <PopoverTrigger
            style={{
              top: `${highlightData.position.top}px`,
              left: `${highlightData.position.left + 30}px`,
              zIndex: 50,
            }}
            className="absolute flex size-7 cursor-pointer items-center justify-center rounded-full border-none bg-gray-200 text-gray-600 shadow-md hover:bg-gray-300"
            aria-label="Writing Assistant button"
            onClick={() => setIsOptionsVisible(true)}
            type="button"
          >
            <FaMagic />
          </PopoverTrigger>
          {isOptionsVisible && !getLastMessage(messages, 'assistant') && (
            <PopoverContent
              ref={optionsContainerRef}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-50 w-96 rounded-md border border-gray-300 bg-white p-2.5"
            >
              <TextField
                inputRef={textFieldRef}
                autoFocus
                type="text"
                variant="outlined"
                size="small"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ask AI anything..."
                className="mb-2.5 w-full p-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleOption('custom', customPrompt)
                  }
                }}
              />
              <div className="max-h-36 overflow-y-auto">
                <Button
                  onClick={() => handleOption('simplify')}
                  className="mb-1 block w-full"
                  style={{ textTransform: 'none' }}
                >
                  Simplify and condense the writing
                </Button>
                <Button
                  onClick={() => handleOption('copy-editor')}
                  className="mb-1 block w-full"
                  style={{ textTransform: 'none' }}
                >
                  Fix spelling and grammar
                </Button>
                <Button
                  onClick={() => handleOption('takeaways')}
                  className="mb-1 block w-full"
                  style={{ textTransform: 'none' }}
                >
                  List key Takeaways
                </Button>
              </div>
            </PopoverContent>
          )}
        </Popover>
      )}

      {getLastMessage(messages, 'assistant') && (
        <div
          ref={markdownContainerRef}
          className="absolute z-50 rounded-lg border border-gray-300 bg-white p-2.5 shadow-md"
          style={{
            top: positionStyle.top,
            left: positionStyle.left,
            width: '385px',
          }}
        >
          <div
            style={{
              maxHeight: markdownMaxHeight,
              overflowY: 'auto',
            }}
          >
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              className={`markdown-content break-words rounded-md p-1 ${getClassNames(lastAssistantMessage)}`}
            >
              {convertMessageToString(getLastMessage(messages, 'assistant'))}
            </ReactMarkdown>
          </div>
          <div className="mt-2 flex justify-between">
            <button
              className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
              onClick={() => {
                getLLMResponse(prevPrompt)
              }}
              type="button"
            >
              Re-run
            </button>
            <button
              className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
              onClick={() => {
                insertAfterHighlightedText()
              }}
              type="button"
            >
              Insert
            </button>
            <button
              className="mr-1 flex cursor-pointer items-center rounded-md border-0 bg-blue-100 px-2.5 py-1"
              onClick={() => {
                copyToClipboard()
              }}
              type="button"
            >
              Copy
            </button>
            <button
              className="flex cursor-pointer items-center rounded-md border-0 bg-indigo-700 px-2.5 py-1 text-white"
              onClick={() => {
                replaceHighlightedText()
              }}
              type="button"
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WritingAssistant
