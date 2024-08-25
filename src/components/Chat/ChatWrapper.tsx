import React, { useCallback, useEffect, useState, useRef } from 'react'

import { DBQueryResult } from 'electron/main/vector-database/schema'
import posthog from 'posthog-js'

import { streamText } from 'ai'
import ChatInput from './ChatInput'
import { anonymizeChatFiltersForPosthog, getChatHistoryContext, resolveLLMClient, resolveRAGContext } from './utils'

import SimilarEntriesComponent from '../Sidebars/SemanticSidebar/SimilarEntriesComponent'
import '../../styles/chat.css'
import ChatMessages, { AskOptions } from './ChatMessages'
import { Chat, ChatFilters } from './types'

interface ChatWrapperProps {
  vaultDirectory: string
  openFileAndOpenEditor: (path: string, optionalContentToWriteOnCreate?: string) => Promise<void>
  currentChatHistory: Chat | undefined
  setCurrentChatHistory: React.Dispatch<React.SetStateAction<Chat | undefined>>
  showSimilarFiles: boolean
  chatFilters: ChatFilters
  setChatFilters: React.Dispatch<ChatFilters>
}

const ChatWrapper: React.FC<ChatWrapperProps> = ({
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
    (chatID: string, newContent: string) => {
      setCurrentChatHistory((prev) => {
        if (chatID !== prev?.id) return prev
        const newDisplayableHistory = prev?.messages || []
        if (newDisplayableHistory.length > 0) {
          const lastMessage = newDisplayableHistory[newDisplayableHistory.length - 1]
          if (lastMessage.role === 'assistant') {
            lastMessage.content += newContent
          } else {
            newDisplayableHistory.push({
              role: 'assistant',
              content: newContent,
              context: [],
            })
          }
        } else {
          newDisplayableHistory.push({
            role: 'assistant',
            content: newContent,
            context: [],
          })
        }
        return {
          id: prev!.id,
          messages: newDisplayableHistory,
        }
      })
    },
    [setCurrentChatHistory], // Add any other dependencies here if needed
  )

  const handleSubmitNewMessage = async (currentChat: Chat | undefined) => {
    posthog.capture('chat_message_submitted', {
      chatId: currentChat?.id,
      chatLength: currentChat?.messages.length,
      chatFilters: anonymizeChatFiltersForPosthog(chatFilters),
    })
    let outputChat = currentChat

    if (loadingResponse || !userTextFieldInput.trim()) return

    setLoadingResponse(true)
    setLoadAnimation(true)

    const defaultLLMName = await window.llm.getDefaultLLMName()
    if (!outputChat || !outputChat.id) {
      outputChat = {
        id: Date.now().toString(),
        messages: [],
      }
    }
    if (outputChat.messages.length === 0) {
      if (chatFilters) {
        outputChat.messages.push(await resolveRAGContext(userTextFieldInput, chatFilters))
      }
    } else {
      outputChat.messages.push({
        role: 'user',
        content: userTextFieldInput,
        context: [],
      })
    }
    setUserTextFieldInput('')

    setCurrentChatHistory(outputChat)

    if (!outputChat) return

    await window.electronStore.updateChatHistory(outputChat)

    const client = await resolveLLMClient(defaultLLMName)

    const { textStream } = await streamText({
      model: client,
      messages: outputChat.messages,
    })

    // eslint-disable-next-line no-restricted-syntax
    for await (const textPart of textStream) {
      appendNewContentToMessageHistory(outputChat.id, textPart)
    }
    setReadyToSave(true)
    // } catch (error) {
    //   if (outputChat) {
    //     appendNewContentToMessageHistory(outputChat.id, errorToStringRendererProcess(error), 'error')
    //   }
    // }
  }

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
  }, [currentChatHistory, currentChatHistory?.id, promptSelected])

  useEffect(() => {
    // Handle prompt selection and message submission separately
    if (promptSelected) {
      handleSubmitNewMessage(undefined)
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [promptSelected])

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
        <ChatMessages
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

export default ChatWrapper
