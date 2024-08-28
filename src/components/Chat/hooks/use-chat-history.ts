import { useEffect, useState } from 'react'

import { getDisplayableChatName } from '../utils'
import { Chat } from '../types'

export interface ChatHistoryMetadata {
  id: string
  displayName: string
}

export const useChatHistory = () => {
  const [currentChatHistory, setCurrentChatHistory] = useState<Chat>()
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

  const updateChatHistoriesMetadata = (retrievedChatHistoriesMetadata: Chat[]) => {
    setChatHistoriesMetadata(
      retrievedChatHistoriesMetadata.map((chat: Chat) => ({
        id: chat.id,
        displayName: getDisplayableChatName(chat),
      })),
    )
  }

  
  useEffect(() => {
    fetchChatHistories()
  }, [])

  return {
    currentChatHistory,
    setCurrentChatHistory,
    chatHistoriesMetadata,
    updateChatHistoriesMetadata,
  }
}
