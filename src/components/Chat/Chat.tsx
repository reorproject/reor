import React, { useCallback, useEffect, useState, useRef } from 'react'

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
    "Create a to-do list based on these tasks.",
    "Generate a study guide from my notes.",
    "Summarize key insights from this document."
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
  openFileByPath: (path: string) => Promise<void>

  currentChatHistory: ChatHistory | undefined
  setCurrentChatHistory: React.Dispatch<React.SetStateAction<ChatHistory | undefined>>
  showSimilarFiles: boolean
  chatFilters: ChatFilters
  setChatFilters: React.Dispatch<ChatFilters>
}

interface ChatContainerProps {
  chatContainerRef: MutableRefObject<HTMLDivElement | null>
  currentChatHistory: ChatHistory | undefined
  handleSubmitNewMessage: () => void
  loadAnimation: boolean
  isAddContextFiltersModalOpen: boolean
  chatFilters: ChatFIlters
  setChatFilters: Dispatch<SetStateAction<ChatFilters>>
  setUserTextFieldInput: Dispatch<SetStateAction<string>>
  defaultModelName: string
  vaultDirectory: string
  setIsAddContextFiltersModalOpen: Dispatch<SetStateAction<boolean>>
  handlePromptSelection: (prompt: string) => void
  askText: AskOptions
}

const ChatWithLLM: React.FC<ChatWithLLMProps> = ({
  vaultDirectory,
  openFileByPath,
  currentChatHistory,
  setCurrentChatHistory,
  showSimilarFiles,
  chatFilters,
  setChatFilters,
}) => {
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>('')
  // const [userNewChatInput, setUserNewChatInput] = useState<string>('')
  const [askText] = useState<AskOptions>(AskOptions.Ask)
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)
  const [loadAnimation, setLoadAnimation] = useState<boolean>(false)
  const [beginStreaming, setBeginStreaming] = useState<boolean>(false)
  const [readyToSave, setReadyToSave] = useState<boolean>(false)
  const [triggerUpdate, setTriggerUpdate] = useState<boolean>(false)
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

  useEffect(() => {
    stopStreamingResponse()
    const context = getChatHistoryContext(currentChatHistory)
    setCurrentContext(context)
  }, [currentChatHistory])

  useEffect(() => {
    if (beginStreaming) {
      setBeginStreaming(false)
      startStreamingResponse()
    }
  }, [beginStreaming])

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

  const handleSubmitNewMessage = async (chatHistory: ChatHistory | undefined) => {
    posthog.capture('chat_message_submitted', {
      chatId: chatHistory?.id,
      chatLength: chatHistory?.displayableChatHistory.length,
      chatFilters: anonymizeChatFiltersForPosthog(chatFilters),
    })
    let outputChatHistory = chatHistory

    try {
      if (loadingResponse || !userTextFieldInput.trim()) return
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
          // chatHistory.displayableChatHistory.push({
          //   role: "system",
          //   content:
          //     "You are an advanced question answer agent answering questions based on provided context. You will respond to queries in second person: saying things like 'you'. The context provided was written by the same user who is asking the question.",
          //   messageType: "success",

          //   context: [],
          // });
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
      setBeginStreaming(true)

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
      stopStreamingResponse()
    }
  }

  useEffect(() => {
    const handleOpenAIChunk = async (receivedChatID: string, chunk: ChatCompletionChunk) => {
      const newContent = chunk.choices[0].delta.content ?? ''
      if (newContent) {
        if (loadAnimation) setLoadAnimation(false)
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const handleAnthropicChunk = async (receivedChatID: string, chunk: MessageStreamEvent) => {
      const newContent = chunk.type === 'content_block_delta' ? (chunk.delta.text ?? '') : ''
      if (newContent) {
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
  }, [appendNewContentToMessageHistory, loadAnimation])

  useEffect(() => {
    if (triggerUpdate) {
      handleSubmitNewMessage(undefined)
      setTriggerUpdate(false)
    }
  }, [triggerUpdate])


  const handlePromptSelection = useCallback((prompt: string) => {
    setUserTextFieldInput(prompt)
    setTriggerUpdate(true)
  }, [setUserTextFieldInput, setTriggerUpdate])


  const stopStreamingResponse = () => {
    setLoadAnimation(false)
    setLoadingResponse(false)
  }

  const startStreamingResponse = () => {
    setLoadAnimation(true)
    setLoadingResponse(true)
  }

  useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
  }, [currentChatHistory]);

  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-dark-gray-c-eleven">
        <ChatContainer
          chatContainerRef={chatContainerRef}
          currentChatHistory={currentChatHistory}
          handleSubmitNewMessage={handleSubmitNewMessage}
          loadAnimation={loadAnimation}
          isAddContextFiltersModalOpen={isAddContextFiltersModalOpen}
          chatFilters={chatFilters}
          setChatFilters={setChatFilters}
          setUserTextFieldInput={setUserTextFieldInput}
          defaultModelName={defaultModelName}
          vaultDirectory={vaultDirectory}
          setIsAddContextFiltersModalOpen={setIsAddContextFiltersModalOpen}
          handlePromptSelection={handlePromptSelection}
          askText={askText}
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
            openFileByPath(path)
            posthog.capture('open_file_from_chat_context')
          }}
          saveCurrentFile={() => Promise.resolve()}
          isLoadingSimilarEntries={false}
        />
      )}
    </div>
  )
}


const ChatContainer: React.FV<ChatContainerProps> = ({
  chatContainerRef,
  currentChatHistory,
  handleSubmitNewMessage,
  loadAnimation,
  isAddContextFiltersModalOpen,
  chatFilters,
  setChatFilters,
  setUserTextFieldInput,
  defaultModelName,
  vaultDirectory,
  setIsAddContextFiltersModalOpen,
  handlePromptSelection,
  askText
}) => {
  const getClassName = (message: ChatMessageToDisplay): string => {
    return message.messageType === 'error'
      ? `markdown-content ${message.messageType}-chat-message text-white`
      : `markdown-content ${message.role}-chat-message`
  }

  return (
    <div 
      ref={chatContainerRef}
      className="chat-container relative flex h-full flex-col items-center justify-center overflow-auto bg-transparent">
      <div
        className={`relative mt-4 flex size-full flex-col gap-3 overflow-x-hidden p-10 pt-0 items-center`}
      >
        <div className={`w-full max-w-3xl flex-col items-center`}>
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
                      <img
                        src="/src/assets/reor-logo.svg"
                        style={{ width: '22px', height: '22px' }}
                        alt="ReorImage"
                      />
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
                    </div>
                  </div>
                </div>
              ))
          ) : (
            // Display centered "Start a conversation..." if there is no currentChatHistory
            <div className="relative flex flex-col w-full">
              <div className="relative flex size-full flex-col text-center lg:top-10">
                <div className="size-full flex justify-center">
                  <img src="/src/assets/reor-logo.svg" style={{ width: '64px', height: '64px' }} alt="ReorImage" />
                </div>
                <h1 className="mb-10 text-gray-300 text-[28px]">Welcome to your AI-powered assistant! Start your first conversation or pick up where you left off.</h1>
                <div className="flex flex-col rounded-md bg-bg-000 focus-within:ring focus-within:ring-gray-700">
                  <textarea
                    onKeyDown={(e) => {
                      if (!e.shiftKey && e.key === 'Enter') {
                        e.preventDefault()
                        handleSubmitNewMessage(undefined)
                      }
                    }}
                    className="h-[100px] w-full resize-none rounded-t-md border-0 bg-transparent p-4 font-styrene text-text-gen-100 caret-white focus:outline-none"
                    placeholder="What can Reor help you with today?"
                    onChange={(e) => setUserTextFieldInput(e.target.value)}
                  />
                  <div className="h-px w-[calc(100%-5%)] self-center bg-gray-600" />
                  <div className="flex items-center justify-between px-4 py-3 ">
                    <span className="rounded-b-md bg-transparent  font-styrene text-sm tracking-tight text-text-gen-100">
                      {defaultModelName}
                    </span>
                    <button
                      className="cursor-pointer rounded-md border-0 bg-blue-600 px-4 py-2 font-styrene text-white hover:bg-blue-500"
                      onClick={() => {
                        setIsAddContextFiltersModalOpen(true)
                      }}
                      type="button"
                    >
                      {chatFilters.files.length > 0 ? 'Update RAG filters' : 'Customise context'}
                    </button>
                  </div>
                </div>
                <div className="size-full mt-4 lg:flex md:flex-row justify-center">
                  {EXAMPLE_PROMPTS[askText].map((option) => (
                      <PromptSuggestion
                        key={option}
                        promptText={option}
                        onClick={() => handlePromptSelection(option)}
                      />
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {loadAnimation && (
          <div className="relative max-w-3xl left-4 ml-1 mt-4 flex w-full items-start gap-6">
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

export default ChatWithLLM
