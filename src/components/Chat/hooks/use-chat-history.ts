import { useEffect, useState } from 'react'

import { ChatHistory } from '../Chat'
import { formatOpenAIMessageContentIntoString } from '../chatUtils'

export interface ChatHistoryMetadata {
  id: string
  displayName: string
}

export const useChatHistory = () => {
  const [currentChatHistory, setCurrentChatHistory] = useState<ChatHistory>()
  const [chatHistoriesMetadata, setChatHistoriesMetadata] = useState<ChatHistoryMetadata[]>([])
  // const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);

  const fetchChatHistories = async () => {
    let allChatHistories = await window.electronStore.getAllChatHistories()
    if (!allChatHistories) {
      allChatHistories = []
    }
    // setAllChatHistories(allChatHistories);
    setChatHistoriesMetadata(
      allChatHistories.map((chat) => ({
        id: chat.id,
        displayName: getDisplayableChatName(chat),
      })),
    )

    setCurrentChatHistory(undefined)
  }

  useEffect(() => {
    const updateChatHistoriesMetadata = window.ipcRenderer.receive(
      'update-chat-histories',
      (chatHistoriesMetadata: ChatHistory[]) => {
        setChatHistoriesMetadata(
          chatHistoriesMetadata.map((chat: ChatHistory) => ({
            id: chat.id,
            displayName: getDisplayableChatName(chat),
          })),
        )
      },
    )

    return () => {
      updateChatHistoriesMetadata()
    }
  }, [])

  useEffect(() => {
    fetchChatHistories()
  }, [])

  return {
    currentChatHistory,
    setCurrentChatHistory,
    chatHistoriesMetadata,
  }
}

export const getDisplayableChatName = (chat: ChatHistory): string => {
  const actualHistory = chat.displayableChatHistory

  if (actualHistory.length === 0 || !actualHistory[actualHistory.length - 1].content) {
    return 'Empty Chat'
  }

  const lastMsg = actualHistory[0]

  if (lastMsg.visibleContent) {
    return lastMsg.visibleContent.slice(0, 30)
  }

  const lastMessage = formatOpenAIMessageContentIntoString(lastMsg.content)
  if (!lastMessage || lastMessage === '') {
    return 'Empty Chat'
  }
  return lastMessage.slice(0, 30)
}
