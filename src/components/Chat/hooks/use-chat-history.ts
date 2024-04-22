import { ChatHistory } from "electron/main/Store/storeConfig";
import { useEffect, useState } from "react";

export const useChatHistory = () => {
  const [currentChatHistory, setCurrentChatHistory] = useState<ChatHistory>();
  const [allChatHistories, setAllChatHistories] = useState<ChatHistory[]>([]);

  const fetchChatHistories = async () => {
    const allChatHistories = await window.electronStore.getAllChatHistories();
    console.log("allChatHistories", allChatHistories);
    setAllChatHistories(allChatHistories);
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
  };
};
