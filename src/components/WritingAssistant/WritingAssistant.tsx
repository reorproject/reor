import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { FaMagic } from 'react-icons/fa'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import posthog from 'posthog-js'
import { streamText } from 'ai'
import useOutsideClick from '../../lib/hooks/use-outside-click'
import { generatePromptString, getLastMessage } from './utils'
import { ReorChatMessage } from '../../lib/llm/types'
import { useFileContext } from '@/contexts/FileContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import resolveLLMClient from '@/lib/llm/client'
import ConversationHistory from './ConversationHistory'

const WritingAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ReorChatMessage[]>([])
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)
  const [customPrompt, setCustomPrompt] = useState<string>('')
  const [isOptionsVisible, setIsOptionsVisible] = useState<boolean>(false)
  const [prevPrompt, setPrevPrompt] = useState<string>('')
  const [positionStyle, setPositionStyle] = useState({ top: 0, left: 0 })
  // const [markdownMaxHeight, setMarkdownMaxHeight] = useState('auto')
  const [isSpaceTrigger, setIsSpaceTrigger] = useState<boolean>(false)
  const [spacePosition, setSpacePosition] = useState<number | null>(null)
  const [cursorPosition, setCursorPosition] = useState<number | null>(null)
  const markdownContainerRef = useRef<HTMLDivElement>(null)
  const optionsContainerRef = useRef<HTMLDivElement>(null)
  const textFieldRef = useRef<HTMLInputElement>(null)
  const lastAssistantMessage = getLastMessage(messages, 'assistant')
  const hasValidMessages = !!lastAssistantMessage
  const [streamingMessage, setStreamingMessage] = useState<string>('')
  const [currentConversationIndex, setCurrentConversationIndex] = useState<number>(0)
  const [isNewConversation, setIsNewConversation] = useState<boolean>(false)
  // const [prompts, setPrompts] = useState<{ option?: string; customPromptInput?: string }[]>([])

  const { editor, highlightData } = useFileContext()
  const [autoContext, setAutoContext] = useState<boolean>(true)

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

  // useLayoutEffect(() => {
  //   if (hasValidMessages) {
  //     const calculateMaxHeight = () => {
  //       if (!markdownContainerRef.current) return

  //       const screenHeight = window.innerHeight
  //       const containerTop = positionStyle.top
  //       const buttonHeight = 30
  //       const padding = 54
  //       const availableHeight = screenHeight - containerTop - buttonHeight - padding

  //       /setMarkdownMaxHeight(`${availableHeight}px`)
  //     }

  //     calculateMaxHeight()
  //     window.addEventListener('resize', calculateMaxHeight)

  //     return () => window.removeEventListener('resize', calculateMaxHeight)
  //   }
  //   return () => {}
  // }, [hasValidMessages, positionStyle.top])

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
    if (!editor || !isSpaceTrigger || spacePosition === null) {
      return undefined
    }

    const resetSpaceTrigger = () => {
      setIsOptionsVisible(false)
      setIsSpaceTrigger(false)
      setSpacePosition(null)
    }

    const checkSpacePresence = () => {
      try {
        if (!editor.state?.doc) {
          resetSpaceTrigger()
          return
        }

        const { from } = editor.state.selection

        if (from !== spacePosition) {
          resetSpaceTrigger()
          return
        }

        const $pos = editor.state.doc.resolve(from)
        if (!$pos?.parent?.textContent?.startsWith(' ')) {
          resetSpaceTrigger()
        }
      } catch (error) {
        resetSpaceTrigger()
      }
    }

    const handler = () => {
      requestAnimationFrame(checkSpacePresence)
    }

    editor.on('update', handler)

    return () => {
      editor.off('update', handler)
    }
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

  useEffect(() => {
    const loadAutoContext = async () => {
      const savedAutoContext = await window.electronStore.getAutoContext()
      setAutoContext(savedAutoContext)
    }
    loadAutoContext()
  }, [])

  const copyToClipboard = () => {
    const assistantMessage = messages[currentConversationIndex + 1]
    if (!assistantMessage || assistantMessage.role !== 'assistant') return

    const copiedText = assistantMessage.visibleContent || assistantMessage.content

    if (copiedText && typeof copiedText === 'string') {
      navigator.clipboard.writeText(copiedText)
    }
  }

  const insertAfterHighlightedText = () => {
    const assistantMessage = messages[currentConversationIndex + 1]
    if (!assistantMessage || assistantMessage.role !== 'assistant' || !editor) return

    const insertionText = assistantMessage.visibleContent || assistantMessage.content

    editor.view.focus()

    const { from, to } = editor.state.selection
    const endOfSelection = Math.max(from, to)

    editor.chain().focus().setTextSelection(endOfSelection).insertContent(`\n${insertionText}`).run()

    setMessages([])
    setCustomPrompt('')
  }

  const replaceHighlightedText = () => {
    const assistantMessage = messages[currentConversationIndex + 1]
    if (!assistantMessage || assistantMessage.role !== 'assistant' || !editor) return

    const replacementText = assistantMessage.visibleContent || assistantMessage.content
    if (replacementText) {
      if (highlightData.text) {
        editor.chain().focus().deleteSelection().insertContent(replacementText).run()
      } else if (autoContext) {
        editor.chain().focus().selectAll().deleteSelection().insertContent(replacementText).run()
      }
    }

    setMessages([])
    setCustomPrompt('')
  }

  const getLLMResponse = async (prompt: string) => {
    const defaultLLMName = await window.llm.getDefaultLLMName()

    if (loadingResponse) return
    setLoadingResponse(true)
    posthog.capture('submitted_writing_assistant_message')

    const newMessage: ReorChatMessage = { role: 'user', content: prompt }
    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)

    setStreamingMessage('')

    const { textStream } = await streamText({
      model: await resolveLLMClient(defaultLLMName),
      messages: updatedMessages,
    })

    let fullResponse = ''
    // eslint-disable-next-line no-restricted-syntax
    for await (const textPart of textStream) {
      fullResponse += textPart
      setStreamingMessage(fullResponse)
    }

    const assistantMessage: ReorChatMessage = { role: 'assistant', content: fullResponse }
    setMessages((prev) => {
      const newMessages = [...prev, assistantMessage]
      setCurrentConversationIndex(newMessages.length - 2)
      return newMessages
    })
    setStreamingMessage('')
    setLoadingResponse(false)
    setIsNewConversation(false)
  }

  const handleOption = async (option: string, customPromptInput?: string) => {
    let selectedText = highlightData.text
    if (autoContext && !selectedText && editor) {
      selectedText = editor.state.doc.textBetween(0, editor.state.doc.content.size)
    }
    if (lastAssistantMessage) {
      selectedText =
        typeof lastAssistantMessage.content === 'string'
          ? lastAssistantMessage.content
          : JSON.stringify(lastAssistantMessage.content)
    }
    const prompt = generatePromptString(option, selectedText, isSpaceTrigger, customPromptInput)
    setPrevPrompt(prompt)
    setIsNewConversation(true)
    setIsOptionsVisible(false)
    await getLLMResponse(prompt)
  }
  const handleAutoContextChange = async (value: boolean) => {
    setAutoContext(value)
    await window.electronStore.setAutoContext(value)
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
              setCustomPrompt('')
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
        <div className="mt-2 flex items-center">
          <label htmlFor="autoContextCheckbox" className="flex items-center">
            <input
              type="checkbox"
              id="autoContextCheckbox"
              checked={autoContext}
              onChange={(e) => handleAutoContextChange(e.target.checked)}
              className="size-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
            />
            <span className="ml-2 select-none text-xs text-gray-400">Use File Content (If no text selected)</span>
          </label>
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
                    setCustomPrompt('')
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

      {(messages.length > 0 || streamingMessage) && (
        <div
          ref={markdownContainerRef}
          className="absolute z-50 rounded-lg border border-gray-300 bg-white p-2.5 shadow-md"
          style={{
            top: positionStyle.top,
            left: positionStyle.left,
            width: '385px',
            maxHeight: '500px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ConversationHistory
            history={messages}
            streamingMessage={streamingMessage}
            // markdownMaxHeight={markdownMaxHeight}
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            handleCustomPrompt={() => handleOption('custom', customPrompt)}
            displayPrompt={prevPrompt}
            currentIndex={currentConversationIndex}
            onNavigate={(direction) => {
              if (direction === 'prev' && currentConversationIndex > 0) {
                setCurrentConversationIndex(currentConversationIndex - 2)
              } else if (direction === 'next' && currentConversationIndex < messages.length - 2) {
                setCurrentConversationIndex(currentConversationIndex + 2)
              }
            }}
            getLLMResponse={getLLMResponse}
            insertAfterHighlightedText={insertAfterHighlightedText}
            copyToClipboard={copyToClipboard}
            replaceHighlightedText={replaceHighlightedText}
            isNewConversation={isNewConversation}
            loadingResponse={loadingResponse}
          />
        </div>
      )}
    </div>
  )
}

export default WritingAssistant
