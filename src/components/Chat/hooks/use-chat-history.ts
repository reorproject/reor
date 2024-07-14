import { useEffect, useState } from 'react'

import { ChatHistory, getDisplayableChatName } from '../chatUtils'

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
      (retrievedChatHistoriesMetadata: ChatHistory[]) => {
        setChatHistoriesMetadata(
          retrievedChatHistoriesMetadata.map((chat: ChatHistory) => ({
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
