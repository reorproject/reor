import React, { useCallback, useEffect, useState } from 'react'

import { MessageStreamEvent } from '@anthropic-ai/sdk/resources'
import { DBQueryResult } from 'electron/main/vector-database/schema'
import { ChatCompletionChunk } from 'openai/resources/chat/completions'
import posthog from 'posthog-js'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import { FaRegUserCircle } from "react-icons/fa";
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

import { LoadingDots } from '@/utils/animations'
import ScrollableContainer from './ChatScrollableIntoView'
import errorToStringRendererProcess from '@/utils/error'
import SimilarEntriesComponent from '../Sidebars/SemanticSidebar/SimilarEntriesComponent'
import '../../styles/chat.css'

// convert ask options to enum
enum AskOptions {
  Ask = 'Ask',
  // AskFile = "Ask File",
  // TemporalAsk = "Temporal Ask",
  // FlashcardAsk = "Flashcard Ask",
}
// const ASK_OPTIONS = Object.values(AskOptions);

const EXAMPLE_PROMPTS: { [key: string]: string[] } = {
  [AskOptions.Ask]: [
    // "What are my thoughts on AGI?",
    // "Tell me about my notes on Nietzsche",
  ],
  // [AskOptions.AskFile]: [
  //   "Summarize this file",
  //   "What are the key points in this file?",
  // ],
  // [AskOptions.TemporalAsk]: [
  //   "Summarize what I have worked on today",
  //   "Which tasks have I completed this past week?",
  // ],
  // [AskOptions.FlashcardAsk]: [
  //   "Create some flashcards based on the current note",
  // ],
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
  const [readyToSave, setReadyToSave] = useState<boolean>(false)
  const [currentContext, setCurrentContext] = useState<DBQueryResult[]>([])
  const [isAddContextFiltersModalOpen, setIsAddContextFiltersModalOpen] = useState<boolean>(false)
  const [defaultLLMName, setDefaultLLMName] = useState<string>('')

  useEffect(() => {
    const fetchDefaultLLM = async () => {
      const defaultName =  await window.llm.getDefaultLLMName()
      setDefaultLLMName(defaultName)
    }

    fetchDefaultLLM()
  }, [])


  useEffect(() => {
    const context = getChatHistoryContext(currentChatHistory)
    setCurrentContext(context)
    setLoadingResponse(false)
    setLoadAnimation(false)
  }, [currentChatHistory])

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
      if (loadingResponse) return
      setLoadingResponse(true)
      setLoadAnimation(true)
      if (!userTextFieldInput.trim()) return
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
    } finally {
      setLoadingResponse(false)
    }
  }

  useEffect(() => {
    const handleOpenAIChunk = async (receivedChatID: string, chunk: ChatCompletionChunk) => {
      const newContent = chunk.choices[0].delta.content ?? ''
      if (newContent) {
        if (loadAnimation)
          setLoadAnimation(false)
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const handleAnthropicChunk = async (receivedChatID: string, chunk: MessageStreamEvent) => {
      const newContent = chunk.type === 'content_block_delta' ? (chunk.delta.text ?? '') : ''
      if (newContent) {
        if (loadAnimation)  
          setLoadAnimation(false)
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const removeOpenAITokenStreamListener = window.ipcRenderer.receive('openAITokenStream', handleOpenAIChunk)

    const removeAnthropicTokenStreamListener = window.ipcRenderer.receive('anthropicTokenStream', handleAnthropicChunk)

    return () => {
      removeOpenAITokenStreamListener()
      removeAnthropicTokenStreamListener()
    }
  }, [appendNewContentToMessageHistory])

  const getClassName = (message: ChatMessageToDisplay): string => {
    return message.messageType === 'error'
      ? `markdown-content ${message.messageType}-chat-message`
      : `markdown-content ${message.role}-chat-message`
  }

  const handleNewChatMessage = () => {
    
  }

  const setContainerMax = !currentChatHistory ? `max-w-xl` : 'max-w-3xl'
  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-neutral-800">
        <ScrollableContainer>
          <div className="chat-container relative flex h-full flex-col items-center justify-center overflow-auto bg-transparent p-10 pt-0">
            <div className={`relative mx-auto mt-4 flex size-full ${setContainerMax} flex-col gap-3`}>  
              {currentChatHistory && currentChatHistory.displayableChatHistory.length > 0 ? (
                // Display chat history if it exists
                currentChatHistory.displayableChatHistory
                  .filter((msg) => msg.role !== 'system')
                  .map((message, index) => (
                    <div className={`w-full ${getClassName(message)} flex`}>
                      <div className="relative items-start pl-4 pt-3">
                        {message.role === 'user' ? (
                          <FaRegUserCircle size={22}  />
                        ) : (
                          <img src="/src/assets/reor-logo.svg" style={{ width: '22px', height: '22px' }} />
                        )}
                      </div>
                      <div className="flex-col w-full gap-1">
                        <div className={`flex flex-col flex-grow px-5 py-2.5`}>
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
                <div className="relative flex flex-col">
                  <div className="relative lg:top-20 flex flex-col size-full text-center">
                    <h1 className="mb-10 text-gray-300">This is a Sample, Username</h1>
                    <div className="flex flex-col rounded-md focus-within:ring focus-within:ring-gray-700 bg-bg-000">
                      <textarea
                        onKeyDown={(e) => {
                          if (!e.shiftKey && e.key == 'Enter') {
                            e.preventDefault()
                            handleSubmitNewMessage(undefined)
                          }
                        }}
                        className="h-[100px] w-full bg-transparent rounded-t-md p-4 caret-white border-0 focus:outline-none resize-none text-text-gen-100 font-styrene"
                        placeholder='What can Reor help you with today?'
                        onChange={(e) => setUserTextFieldInput(e.target.value)}         
                      />
                      <div className="self-center w-[calc(100%-5%)] bg-gray-600 h-[1px]"></div>
                      <div className="flex justify-between items-center px-4 py-3 ">
                        <span className="bg-transparent rounded-b-md  text-sm text-text-gen-100 tracking-tight font-styrene">
                         {defaultLLMName}
                        </span>
                        <button
                          className="px-4 py-2 border-0 rounded-md bg-blue-600 hover:bg-blue-500 text-white cursor-pointer font-styrene"
                          onClick={() => {
                            setIsAddContextFiltersModalOpen(true)
                          }}
                          type="button"
                        >
                          {chatFilters.files.length > 0 ? 'Update RAG filters' : 'Customise context'}
                        </button>
                        {EXAMPLE_PROMPTS[askText].map((option) => (
                          <PromptSuggestion
                            key={option}
                            promptText={option}
                            onClick={() => {
                              setUserTextFieldInput(option)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {loadAnimation && (
                <div className="relative ml-1 left-4 flex items-start gap-6 mt-4 w-full">
                  <img src="/src/assets/reor-logo.svg" style={{ width: '22px', height: '22px' }} />
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
            {/* {EXAMPLE_PROMPTS[askText].map((option, index) => {
              return (
                <PromptSuggestion
                  key={index}
                  promptText={option}
                  onClick={() => {
                    setUserTextFieldInput(option);
                  }}
                />
              );
            })} */}
            {userTextFieldInput === '' &&
            (!currentChatHistory || currentChatHistory?.displayableChatHistory.length === 0) ? (
              <>
                {EXAMPLE_PROMPTS[askText].map((option) => (
                  <PromptSuggestion
                    key={option}
                    promptText={option}
                    onClick={() => {
                      setUserTextFieldInput(option)
                    }}
                  />
                ))}
              </>
            ) : undefined}
          </div>
        </ScrollableContainer>

        {currentChatHistory && 
          <ChatInput
            userTextFieldInput={userTextFieldInput}
            setUserTextFieldInput={setUserTextFieldInput}
            handleSubmitNewMessage={() => handleSubmitNewMessage(currentChatHistory)}
            loadingResponse={loadingResponse}
            askText={askText}
          />
        }
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

export default ChatWithLLM
