import React, { useCallback, useEffect, useState, useRef, Dispatch, MutableRefObject, SetStateAction } from 'react'

import { HiOutlineClipboardCopy, HiOutlinePencilAlt } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { MessageStreamEvent } from '@anthropic-ai/sdk/resources'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import { ChatCompletionChunk } from 'openai/resources/chat/completions'
import posthog from 'posthog-js'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { FaRegUserCircle } from 'react-icons/fa'
import AddContextFiltersModal from './AddContextFiltersModal'
import PromptSuggestion from './Chat-Prompts'
import ChatInput from './ChatInput'
import {
  ChatFilters,
  ChatHistory,
  ChatMessageToDisplay,
  formatOpenAIMessageContentIntoString,
  getChatHistoryContext,
  resolveRAGContext,
} from './chatUtils'

import LoadingDots from '@/utils/animations'
import errorToStringRendererProcess from '@/utils/error'
import SimilarEntriesComponent from '../Sidebars/SemanticSidebar/SimilarEntriesComponent'
import '../../styles/chat.css'

// convert ask options to enum
enum AskOptions {
  Ask = 'Ask',
}

const EXAMPLE_PROMPTS: { [key: string]: string[] } = {
  [AskOptions.Ask]: [
    'What have I written about Philosophy?',
    'Generate a study guide from my notes.',
    'Which authors have I discussed positively about?',
  ],
}

interface AnonymizedChatFilters {
  numberOfChunksToFetch: number
  filesLength: number
  minDate?: Date
  maxDate?: Date
}

function anonymizeChatFiltersForPosthog(chatFilters: ChatFilters): AnonymizedChatFilters {
  const { numberOfChunksToFetch, files, minDate, maxDate } = chatFilters
  return {
    numberOfChunksToFetch,
    filesLength: files.length,
    minDate,
    maxDate,
  }
}

interface ChatWithLLMProps {
  vaultDirectory: string
  openFileAndOpenEditor: (path: string, optionalContentToWriteOnCreate?: string) => Promise<void>
  currentChatHistory: ChatHistory | undefined
  setCurrentChatHistory: React.Dispatch<React.SetStateAction<ChatHistory | undefined>>
  showSimilarFiles: boolean
  chatFilters: ChatFilters
  setChatFilters: React.Dispatch<ChatFilters>
}

interface ChatContainerProps {
  chatContainerRef: MutableRefObject<HTMLDivElement | null>
  openFileAndOpenEditor: (path: string, optionalContentToWriteOnCreate?: string) => Promise<void>
  currentChatHistory: ChatHistory | undefined
  isAddContextFiltersModalOpen: boolean
  chatFilters: ChatFilters
  setChatFilters: Dispatch<ChatFilters>
  setUserTextFieldInput: Dispatch<SetStateAction<string>>
  defaultModelName: string
  vaultDirectory: string
  setIsAddContextFiltersModalOpen: Dispatch<SetStateAction<boolean>>
  handlePromptSelection: (prompt: string | undefined) => void
  askText: AskOptions
  loadAnimation: boolean
}

const ChatContainer: React.FC<ChatContainerProps> = ({
  chatContainerRef,
  openFileAndOpenEditor,
  currentChatHistory,
  isAddContextFiltersModalOpen,
  chatFilters,
  setChatFilters,
  setUserTextFieldInput,
  defaultModelName,
  vaultDirectory,
  setIsAddContextFiltersModalOpen,
  handlePromptSelection,
  askText,
  loadAnimation,
}) => {
  const getClassName = (message: ChatMessageToDisplay): string => {
    return message.messageType === 'error'
      ? `markdown-content ${message.messageType}-chat-message text-white`
      : `markdown-content ${message.role}-chat-message`
  }

  const getDisplayMessage = (message: ChatMessageToDisplay): string | undefined => {
    return message.visibleContent ? message.visibleContent : formatOpenAIMessageContentIntoString(message.content)
  }

  const copyToClipboard = (message: ChatMessageToDisplay) => {
    navigator.clipboard.writeText(getDisplayMessage(message) ?? '')
    toast.success('Copied to clipboard!')
  }

  const createNewNote = async (message: ChatMessageToDisplay) => {
    const title = `${(getDisplayMessage(message) ?? `${new Date().toDateString()}`).substring(0, 20)}...`
    openFileAndOpenEditor(title, getDisplayMessage(message))
  }

  return (
    <div
      ref={chatContainerRef}
      className="chat-container relative flex h-full flex-col items-center justify-center overflow-auto bg-transparent"
    >
      <div className="relative mt-4 flex size-full flex-col items-center gap-3 overflow-x-hidden p-10 pt-0">
        <div className="w-full max-w-3xl">
          {currentChatHistory && currentChatHistory.displayableChatHistory.length > 0 ? (
            // Display chat history if it exists
            currentChatHistory.displayableChatHistory
              .filter((msg) => msg.role !== 'system')
              .map((message, index) => (
                <div className={`w-full ${getClassName(message)} flex`}>
                  <div className="relative items-start pl-4 pt-3">
                    {message.role === 'user' ? (
                      <FaRegUserCircle size={22} />
                    ) : (
                      <img src="/src/assets/reor-logo.svg" style={{ width: '22px', height: '22px' }} alt="ReorImage" />
                    )}
                  </div>
                  <div className="w-full flex-col gap-1">
                    <div className="flex grow flex-col px-5 py-2.5">
                      <ReactMarkdown
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        rehypePlugins={[rehypeRaw]}
                        className="max-w-[95%] break-words"
                      >
                        {message.visibleContent
                          ? message.visibleContent
                          : formatOpenAIMessageContentIntoString(message.content)}
                      </ReactMarkdown>
                      {message.role === 'assistant' && (
                        <div className="flex">
                          <div
                            className="cursor-pointer items-center justify-center rounded p-1 hover:bg-neutral-700"
                            onClick={() => copyToClipboard(message)}
                          >
                            <HiOutlineClipboardCopy color="gray" size={18} className="text-gray-200" title="Copy" />
                          </div>
                          <div
                            className="cursor-pointer items-center justify-center rounded p-1 hover:bg-neutral-700"
                            onClick={() => createNewNote(message)}
                          >
                            <HiOutlinePencilAlt color="gray" size={18} className="text-gray-200" title="New Note" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            // Display centered "Start a conversation..." if there is no currentChatHistory
            <div className="relative flex w-full flex-col items-center">
              <div className="relative flex size-full flex-col text-center lg:top-10 lg:max-w-2xl">
                <div className="flex size-full justify-center">
                  <img src="/src/assets/reor-logo.svg" style={{ width: '64px', height: '64px' }} alt="ReorImage" />
                </div>
                <h1 className="mb-10 text-[28px] text-gray-300">
                  Welcome to your AI-powered assistant! Start a conversation with your second brain!
                </h1>
                <div className="flex flex-col rounded-md bg-bg-000 focus-within:ring-1 focus-within:ring-[#8c8c8c]">
                  <textarea
                    onKeyDown={(e) => {
                      if (!e.shiftKey && e.key === 'Enter') {
                        e.preventDefault()
                        handlePromptSelection(undefined)
                      }
                    }}
                    className="h-[100px] w-full resize-none rounded-t-md border-0 bg-transparent p-4 text-text-gen-100 caret-white focus:outline-none"
                    placeholder="What can Reor help you with today?"
                    onChange={(e) => setUserTextFieldInput(e.target.value)}
                  />
                  <div className="h-px w-[calc(100%-5%)] self-center bg-gray-600" />
                  <div className="flex items-center justify-between px-4 py-3 ">
                    <span className="rounded-b-md bg-transparent text-sm tracking-tight text-text-gen-100">
                      {defaultModelName}
                    </span>
                    <button
                      className="cursor-pointer rounded-md border-0 bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
                      onClick={() => {
                        setIsAddContextFiltersModalOpen(true)
                      }}
                      type="button"
                    >
                      {chatFilters.files.length > 0 ? 'Update RAG filters' : 'Customise context'}
                    </button>
                  </div>
                </div>
                <div className="mt-4 size-full justify-center md:flex-row lg:flex">
                  {EXAMPLE_PROMPTS[askText].map((option) => (
                    <PromptSuggestion key={option} promptText={option} onClick={() => handlePromptSelection(option)} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {loadAnimation && (
          <div className="relative left-4 ml-1 mt-4 flex w-full max-w-3xl items-start gap-6">
            <img src="/src/assets/reor-logo.svg" style={{ width: '22px', height: '22px' }} alt="ReorImage" />
            <LoadingDots />
          </div>
        )}

        {isAddContextFiltersModalOpen && (
          <AddContextFiltersModal
            vaultDirectory={vaultDirectory}
            isOpen={isAddContextFiltersModalOpen}
            onClose={() => setIsAddContextFiltersModalOpen(false)}
            chatFilters={chatFilters}
            setChatFilters={setChatFilters}
          />
        )}
      </div>
    </div>
  )
}

const ChatWithLLM: React.FC<ChatWithLLMProps> = ({
  vaultDirectory,
  openFileAndOpenEditor,
  currentChatHistory,
  setCurrentChatHistory,
  showSimilarFiles,
  chatFilters,
  setChatFilters,
}) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>('')
  const [askText] = useState<AskOptions>(AskOptions.Ask)
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)
  const [loadAnimation, setLoadAnimation] = useState<boolean>(false)
  const [readyToSave, setReadyToSave] = useState<boolean>(false)
  const [promptSelected, setPromptSelected] = useState<boolean>(false)
  const [currentContext, setCurrentContext] = useState<DBQueryResult[]>([])
  const [isAddContextFiltersModalOpen, setIsAddContextFiltersModalOpen] = useState<boolean>(false)
  const [defaultModelName, setDefaultLLMName] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchDefaultLLM = async () => {
      const defaultName = await window.llm.getDefaultLLMName()
      setDefaultLLMName(defaultName)
    }

    fetchDefaultLLM()
  }, [])

  // update chat context when files are added
  useEffect(() => {
    const setContextOnFileAdded = async () => {
      if (chatFilters.files.length > 0) {
        const results = await window.fileSystem.getFilesystemPathsAsDBItems(chatFilters.files)
        setCurrentContext(results as DBQueryResult[])
      } else if (!currentChatHistory?.id) {
        // if there is no prior history, set current context to empty
        setCurrentContext([])
      }
    }
    setContextOnFileAdded()
  }, [chatFilters.files, currentChatHistory?.id])

  useEffect(() => {
    if (readyToSave && currentChatHistory) {
      window.electronStore.updateChatHistory(currentChatHistory)
      setReadyToSave(false)
    }
  }, [readyToSave, currentChatHistory])

  const appendNewContentToMessageHistory = useCallback(
    (chatID: string, newContent: string, newMessageType: 'success' | 'error') => {
      setCurrentChatHistory((prev) => {
        if (chatID !== prev?.id) return prev
        const newDisplayableHistory = prev?.displayableChatHistory || []
        if (newDisplayableHistory.length > 0) {
          const lastMessage = newDisplayableHistory[newDisplayableHistory.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.content += newContent
            lastMessage.messageType = newMessageType
          } else {
            newDisplayableHistory.push({
              role: 'assistant',
              content: newContent,
              messageType: newMessageType,
              context: [],
            })
          }
        } else {
          newDisplayableHistory.push({
            role: 'assistant',
            content: newContent,
            messageType: newMessageType,
            context: [],
          })
        }
        return {
          id: prev!.id,
          displayableChatHistory: newDisplayableHistory,
          openAIChatHistory: newDisplayableHistory.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }
      })
    },
    [setCurrentChatHistory], // Add any other dependencies here if needed
  )

  /* eslint-disable */
  const handleSubmitNewMessage = async (chatHistory: ChatHistory | undefined) => {
    posthog.capture('chat_message_submitted', {
      chatId: chatHistory?.id,
      chatLength: chatHistory?.displayableChatHistory.length,
      chatFilters: anonymizeChatFiltersForPosthog(chatFilters),
    })
    let outputChatHistory = chatHistory

    try {
      if (loadingResponse || !userTextFieldInput.trim()) return
      setLoadingResponse(true)
      setLoadAnimation(true)
      const defaultLLMName = await window.llm.getDefaultLLMName()
      if (!outputChatHistory || !outputChatHistory.id) {
        const chatID = Date.now().toString()
        outputChatHistory = {
          id: chatID,
          displayableChatHistory: [],
        }
      }
      if (outputChatHistory.displayableChatHistory.length === 0) {
        if (chatFilters) {
          outputChatHistory.displayableChatHistory.push(await resolveRAGContext(userTextFieldInput, chatFilters))
        }
      } else {
        outputChatHistory.displayableChatHistory.push({
          role: 'user',
          content: userTextFieldInput,
          messageType: 'success',
          context: [],
        })
      }
      setUserTextFieldInput('')

      setCurrentChatHistory(outputChatHistory)

      if (!outputChatHistory) return

      await window.electronStore.updateChatHistory(outputChatHistory)

      const llmConfigs = await window.llm.getLLMConfigs()

      const currentModelConfig = llmConfigs.find((config) => config.modelName === defaultLLMName)
      if (!currentModelConfig) {
        throw new Error(`No model config found for model: ${defaultLLMName}`)
      }

      await window.llm.streamingLLMResponse(defaultLLMName, currentModelConfig, false, outputChatHistory)
      setReadyToSave(true)
    } catch (error) {
      if (outputChatHistory) {
        appendNewContentToMessageHistory(outputChatHistory.id, errorToStringRendererProcess(error), 'error')
      }
    }
  }
  /* eslint-enable */

  /* eslint-disable */
  useEffect(() => {
    // Update context when the chat history changes
    const context = getChatHistoryContext(currentChatHistory)
    setCurrentContext(context)

    if (!promptSelected) {
      setLoadAnimation(false)
      setLoadingResponse(false)
    } else {
      setPromptSelected(false)
    }
  }, [currentChatHistory?.id])
  /* eslint-enable */

  useEffect(() => {
    // Handle prompt selection and message submission separately
    if (promptSelected) {
      handleSubmitNewMessage(undefined)
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [promptSelected])

  useEffect(() => {
    const handleOpenAIChunk = async (receivedChatID: string, chunk: ChatCompletionChunk) => {
      const newContent = chunk.choices[0].delta.content ?? ''
      if (newContent && receivedChatID === currentChatHistory?.id) {
        if (loadAnimation) setLoadAnimation(false)
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const handleAnthropicChunk = async (receivedChatID: string, chunk: MessageStreamEvent) => {
      const newContent = chunk.type === 'content_block_delta' ? (chunk.delta.text ?? '') : ''
      if (newContent && receivedChatID === currentChatHistory?.id) {
        if (loadAnimation) setLoadAnimation(false)
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const removeOpenAITokenStreamListener = window.ipcRenderer.receive('openAITokenStream', handleOpenAIChunk)

    const removeAnthropicTokenStreamListener = window.ipcRenderer.receive('anthropicTokenStream', handleAnthropicChunk)

    return () => {
      removeOpenAITokenStreamListener()
      removeAnthropicTokenStreamListener()
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [appendNewContentToMessageHistory, loadingResponse, currentChatHistory?.id])

  const handleNewChatMessage = useCallback(
    (prompt: string | undefined) => {
      if (prompt) setUserTextFieldInput(prompt)
      setPromptSelected(true)
    },
    [setUserTextFieldInput],
  )

  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-dark-gray-c-eleven">
        <ChatContainer
          chatContainerRef={chatContainerRef}
          openFileAndOpenEditor={openFileAndOpenEditor}
          currentChatHistory={currentChatHistory}
          isAddContextFiltersModalOpen={isAddContextFiltersModalOpen}
          chatFilters={chatFilters}
          setChatFilters={setChatFilters}
          setUserTextFieldInput={setUserTextFieldInput}
          defaultModelName={defaultModelName}
          vaultDirectory={vaultDirectory}
          setIsAddContextFiltersModalOpen={setIsAddContextFiltersModalOpen}
          handlePromptSelection={handleNewChatMessage}
          askText={askText}
          loadAnimation={loadAnimation}
        />

        {currentChatHistory && (
          <ChatInput
            userTextFieldInput={userTextFieldInput}
            setUserTextFieldInput={setUserTextFieldInput}
            handleSubmitNewMessage={() => handleSubmitNewMessage(currentChatHistory)}
            loadingResponse={loadingResponse}
          />
        )}
      </div>
      {showSimilarFiles && (
        <SimilarEntriesComponent
          similarEntries={currentContext}
          titleText="Context used in chat"
          onFileSelect={(path: string) => {
            openFileAndOpenEditor(path)
            posthog.capture('open_file_from_chat_context')
          }}
          saveCurrentFile={() => Promise.resolve()}
          isLoadingSimilarEntries={false}
        />
      )}
    </div>
  )
}

export default ChatWithLLM
