import React, { useCallback, useEffect, useState, useRef } from 'react'

import posthog from 'posthog-js'

import { streamText } from 'ai'
import { anonymizeChatFiltersForPosthog, resolveLLMClient, resolveRAGContext } from './utils'

import '../../styles/chat.css'
import ChatMessages from './ChatMessages'
import { Chat, ChatFilters } from './types'
import { useChatContext } from '@/contexts/ChatContext'
import StartConversation from './StartConversation'

const ChatComponent: React.FC = () => {
  // const [userTextFieldInput, setUserTextFieldInput] = useState<string | undefined>()
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false)
  const [loadAnimation, setLoadAnimation] = useState<boolean>(false)
  const [readyToSave, setReadyToSave] = useState<boolean>(false)
  // const [currentContext, setCurrentContext] = useState<DBQueryResult[]>([])
  const [defaultModelName, setDefaultLLMName] = useState<string>('')
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { setCurrentChatHistory, currentChatHistory } = useChatContext()

  useEffect(() => {
    const fetchDefaultLLM = async () => {
      const defaultName = await window.llm.getDefaultLLMName()
      setDefaultLLMName(defaultName)
    }

    fetchDefaultLLM()
  }, [])

  // useEffect(() => {
  //   const setContextOnFileAdded = async () => {
  //     if (chatFilters.files.length > 0) {
  //       const results = await window.fileSystem.getFilesystemPathsAsDBItems(chatFilters.files)
  //       setCurrentContext(results as DBQueryResult[])
  //     } else if (!currentChatHistory?.id) {
  //       // if there is no prior history, set current context to empty
  //       setCurrentContext([])
  //     }
  //   }
  //   setContextOnFileAdded()
  // }, [chatFilters.files, currentChatHistory?.id])

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
    [setCurrentChatHistory],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSubmitNewMessage = async (
    currentChat: Chat | undefined,
    userTextFieldInput: string | undefined,
    chatFilters?: ChatFilters,
  ) => {
    console.log('calling new chat with', userTextFieldInput)
    console.log('curent chat: ', currentChat)
    posthog.capture('chat_message_submitted', {
      chatId: currentChat?.id,
      chatLength: currentChat?.messages.length,
      chatFilters: anonymizeChatFiltersForPosthog(chatFilters),
    })
    let outputChat = currentChat

    if (loadingResponse || !userTextFieldInput?.trim()) return

    setLoadingResponse(true)
    setLoadAnimation(true)

    const defaultLLMName = await window.llm.getDefaultLLMName()
    if (!outputChat || !outputChat.id) {
      outputChat = {
        id: Date.now().toString(),
        messages: [],
      }
    }
    if (outputChat.messages.length === 0 && chatFilters) {
      outputChat.messages.push(await resolveRAGContext(userTextFieldInput ?? '', chatFilters))
    } else {
      outputChat.messages.push({
        role: 'user',
        content: userTextFieldInput,
        context: [],
      })
    }
    // setUserTextFieldInput('')

    setCurrentChatHistory(outputChat)

    if (!outputChat) return

    await window.electronStore.updateChatHistory(outputChat)

    const client = await resolveLLMClient(defaultLLMName)
    console.log('outputchat is: ', outputChat)
    const { textStream } = await streamText({
      model: client,
      messages: outputChat.messages,
    })

    // eslint-disable-next-line no-restricted-syntax
    for await (const textPart of textStream) {
      appendNewContentToMessageHistory(outputChat.id, textPart)
    }
    setLoadingResponse(false)
    setReadyToSave(true)
  }

  // useEffect(() => {
  //   // Update context when the chat history changes
  //   const context = getChatHistoryContext(currentChatHistory)
  //   setCurrentContext(context)

  //   if (!promptSelected) {
  //     setLoadAnimation(false)
  //     setLoadingResponse(false)
  //   } else {
  //     setPromptSelected(false)
  //   }
  // }, [currentChatHistory, currentChatHistory?.id, promptSelected])

  // useEffect(() => {
  //   // Handle prompt selection and message submission separately
  //   if (promptSelected) {
  //     handleSubmitNewMessage(undefined)
  //   }
  //   /* eslint-disable-next-line react-hooks/exhaustive-deps */
  // }, [promptSelected])

  // const handleNewChatMessage = useCallback(
  //   (prompt: string | undefined) => {
  //     setUserTextFieldInput(prompt)
  //   },
  //   [setUserTextFieldInput],
  // )

  const handleNewChatMessage = useCallback(
    (userTextFieldInput: string | undefined, chatFilters?: ChatFilters) => {
      handleSubmitNewMessage(currentChatHistory, userTextFieldInput, chatFilters)
    },
    [currentChatHistory, handleSubmitNewMessage],
  )

  return (
    <div className="flex size-full items-center justify-center">
      <div className="mx-auto flex size-full flex-col overflow-hidden border-y-0 border-l-[0.001px] border-r-0 border-solid border-neutral-700 bg-dark-gray-c-eleven">
        {currentChatHistory && currentChatHistory.messages && currentChatHistory.messages.length > 0 ? (
          <ChatMessages
            currentChatHistory={currentChatHistory}
            chatContainerRef={chatContainerRef}
            // userTextFieldInput={userTextFieldInput}
            // setUserTextFieldInput={setUserTextFieldInput}
            loadAnimation={loadAnimation}
            handleNewChatMessage={handleNewChatMessage}
            loadingResponse={loadingResponse}
          />
        ) : (
          <StartConversation
            // chatFilters={chatFilters}
            // setChatFilters={setChatFilters}
            // setUserTextFieldInput={setUserTextFieldInput}
            defaultModelName={defaultModelName}
            // isAddContextFiltersModalOpen={isAddContextFiltersModalOpen}
            // setIsAddContextFiltersModalOpen={setIsAddContextFiltersModalOpen}
            handleNewChatMessage={handleNewChatMessage}
          />
        )}

        {/* {currentChatHistory && (
          <ChatInput
            userTextFieldInput={userTextFieldInput}
            setUserTextFieldInput={setUserTextFieldInput}
            handleSubmitNewMessage={() => handleSubmitNewMessage(currentChatHistory)}
            loadingResponse={loadingResponse}
          />
        )} */}
      </div>
      {/* {showSimilarFiles && (
        <SimilarEntriesComponent
          similarEntries={currentContext}
          titleText="Context used in chat"
          onSelect={(path: string) => {
            openTabContent(path)
            posthog.capture('open_file_from_chat_context')
          }}
          isLoadingSimilarEntries={false}
        />
      )} */}
    </div>
  )
}

export default ChatComponent
