import { useEffect, useState } from "react";
import { ChatHistory } from "../Chat";

export interface ChatHistoryMetadata {
  id: string;
}

export const useChatHistory = () => {
  const [currentChatHistory, setCurrentChatHistory] = useState<ChatHistory>();
  const [chatHistoriesMetadata, setChatHistoriesMetadata] = useState<
    ChatHistoryMetadata[]
  >([]);
  const [allChatHistories, setAllChatHistories] = useState<ChatHistory[]>([]);

  const fetchChatHistories = async () => {
    const allChatHistories = await window.electronStore.getAllChatHistories();
    console.log("allChatHistories", allChatHistories);
    setAllChatHistories(allChatHistories);
    setChatHistoriesMetadata(allChatHistories.map((chat) => ({ id: chat.id })));

    setCurrentChatHistory(undefined);
  };

  useEffect(() => {
    fetchChatHistories();
  }, []);

  return {
    allChatHistories,
    setAllChatHistories,
    currentChatHistory,
    setCurrentChatHistory,
    chatHistoriesMetadata,
    setChatHistoriesMetadata,
  };
};
