import React, { useEffect, useState } from 'react'

import { MessageStreamEvent } from '@anthropic-ai/sdk/resources'
import { DBEntry, DBQueryResult } from 'electron/main/vector-database/schema'
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import posthog from 'posthog-js'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'

import AddContextFiltersModal from './AddContextFiltersModal'
import { PromptSuggestion } from './Chat-Prompts'
import ChatInput from './ChatInput'
import { formatOpenAIMessageContentIntoString, resolveRAGContext } from './chatUtils'

import errorToStringRendererProcess from '@/utils/error'
import SimilarEntriesComponent from '../Sidebars/SemanticSidebar/SimilarEntriesComponent'

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

export type ChatHistory = {
  id: string
  displayableChatHistory: ChatMessageToDisplay[]
}
export type ChatMessageToDisplay = ChatCompletionMessageParam & {
  messageType: 'success' | 'error'
  context: DBEntry[]
  visibleContent?: string
}

export interface ChatFilters {
  numberOfChunksToFetch: number
  files: string[]
  minDate?: Date
  maxDate?: Date
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
  const [askText] = useState<AskOptions>(AskOptions.Ask)
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)
  const [readyToSave, setReadyToSave] = useState<boolean>(false)
  const [currentContext, setCurrentContext] = useState<DBQueryResult[]>([])
  const [isAddContextFiltersModalOpen, setIsAddContextFiltersModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const context = getChatHistoryContext(currentChatHistory)
    setCurrentContext(context)
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
  }, [chatFilters.files])

  useEffect(() => {
    if (readyToSave && currentChatHistory) {
      window.electronStore.updateChatHistory(currentChatHistory)
      setReadyToSave(false)
    }
  }, [readyToSave, currentChatHistory])

  const handleSubmitNewMessage = async (chatHistory: ChatHistory | undefined) => {
    posthog.capture('chat_message_submitted', {
      chatId: chatHistory?.id,
      chatLength: chatHistory?.displayableChatHistory.length,
      chatFilters: anonymizeChatFiltersForPosthog(chatFilters),
    })
    try {
      if (loadingResponse) return
      setLoadingResponse(true)
      if (!userTextFieldInput.trim()) return
      const defaultLLMName = await window.llm.getDefaultLLMName()

      if (!chatHistory || !chatHistory.id) {
        const chatID = Date.now().toString()
        chatHistory = {
          id: chatID,
          displayableChatHistory: [],
        }
      }
      if (chatHistory.displayableChatHistory.length === 0) {
        if (chatFilters) {
          // chatHistory.displayableChatHistory.push({
          //   role: "system",
          //   content:
          //     "You are an advanced question answer agent answering questions based on provided context. You will respond to queries in second person: saying things like 'you'. The context provided was written by the same user who is asking the question.",
          //   messageType: "success",

          //   context: [],
          // });
          chatHistory.displayableChatHistory.push(await resolveRAGContext(userTextFieldInput, chatFilters))
        }
      } else {
        chatHistory.displayableChatHistory.push({
          role: 'user',
          content: userTextFieldInput,
          messageType: 'success',
          context: [],
        })
      }

      setUserTextFieldInput('')

      setCurrentChatHistory(chatHistory)

      if (!chatHistory) return

      await window.electronStore.updateChatHistory(chatHistory)

      const llmConfigs = await window.llm.getLLMConfigs()

      const currentModelConfig = llmConfigs.find((config) => config.modelName === defaultLLMName)
      if (!currentModelConfig) {
        throw new Error(`No model config found for model: ${defaultLLMName}`)
      }

      await window.llm.streamingLLMResponse(defaultLLMName, currentModelConfig, false, chatHistory)
      setReadyToSave(true)
    } catch (error) {
      if (chatHistory) {
        appendNewContentToMessageHistory(chatHistory.id, errorToStringRendererProcess(error), 'error')
      }
    }
    // so here we could save the chat history
    setLoadingResponse(false)
  }

  const appendNewContentToMessageHistory = (
    chatID: string,
    newContent: string,
    newMessageType: 'success' | 'error',
  ) => {
    setCurrentChatHistory((prev) => {
      if (chatID !== prev?.id) return prev
      const newDisplayableHistory = prev?.displayableChatHistory || []
      if (newDisplayableHistory.length > 0) {
        const lastMessage = newDisplayableHistory[newDisplayableHistory.length - 1]

        if (lastMessage.role === 'assistant') {
          lastMessage.content += newContent // Append new content with a space
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
  }

  useEffect(() => {
    const handleOpenAIChunk = async (receivedChatID: string, chunk: ChatCompletionChunk) => {
      const newContent = chunk.choices[0].delta.content ?? ''
      if (newContent) {
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const handleAnthropicChunk = async (receivedChatID: string, chunk: MessageStreamEvent) => {
      const newContent = chunk.type === 'content_block_delta' ? (chunk.delta.text ?? '') : ''
      if (newContent) {
        appendNewContentToMessageHistory(receivedChatID, newContent, 'success')
      }
    }

    const removeOpenAITokenStreamListener = window.ipcRenderer.receive('openAITokenStream', handleOpenAIChunk)

    const removeAnthropicTokenStreamListener = window.ipcRenderer.receive('anthropicTokenStream', handleAnthropicChunk)

    return () => {
      removeOpenAITokenStreamListener()
      removeAnthropicTokenStreamListener()
    }
  }, [])

  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-neutral-800">
        <div className="flex h-full flex-col overflow-auto bg-transparent p-3 pt-0">
          <div className="mx-4 mt-2 grow space-y-2">
            {currentChatHistory?.displayableChatHistory
              .filter((msg) => msg.role !== 'system')
              .map((message, index) => (
                <ReactMarkdown
                  key={index}
                  rehypePlugins={[rehypeRaw]}
                  className={`markdown-content break-words rounded-lg p-1 ${
                    message.messageType === 'error'
                      ? 'bg-red-100 text-red-800'
                      : message.role === 'assistant'
                        ? 'bg-neutral-600	text-gray-200'
                        : 'bg-blue-100	text-blue-800'
                  } `}
                >
                  {message.visibleContent
                    ? message.visibleContent
                    : formatOpenAIMessageContentIntoString(message.content)}
                </ReactMarkdown>
              ))}
          </div>
          {(!currentChatHistory || currentChatHistory?.displayableChatHistory.length == 0) && (
            <>
              <div className="flex items-center justify-center text-sm text-gray-300">
                Start a conversation with your notes by typing a message below.
              </div>
              <div className="flex items-center justify-center text-sm text-gray-300">
                <button
                  className="vertical-align m-2 h-6 w-40
                  cursor-pointer rounded-lg border-none bg-slate-600 text-center text-white"
                  onClick={() => {
                    setIsAddContextFiltersModalOpen(true)
                  }}
                >
                  {chatFilters.files.length > 0 ? 'Update RAG filters' : 'Customise context'}
                </button>
              </div>
            </>
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
          (!currentChatHistory || currentChatHistory?.displayableChatHistory.length == 0) ? (
            <>
              {EXAMPLE_PROMPTS[askText].map((option, index) => (
                <PromptSuggestion
                  key={index}
                  promptText={option}
                  onClick={() => {
                    setUserTextFieldInput(option)
                  }}
                />
              ))}
            </>
          ) : undefined}
        </div>
        <ChatInput
          userTextFieldInput={userTextFieldInput}
          setUserTextFieldInput={setUserTextFieldInput}
          handleSubmitNewMessage={() => handleSubmitNewMessage(currentChatHistory)}
          loadingResponse={loadingResponse}
          askText={askText}
        />
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

const getChatHistoryContext = (chatHistory: ChatHistory | undefined): DBQueryResult[] => {
  if (!chatHistory) return []
  const contextForChat = chatHistory.displayableChatHistory.map((message) => message.context).flat()
  return contextForChat as DBQueryResult[]
}

export default ChatWithLLM
