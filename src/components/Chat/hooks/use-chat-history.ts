import { useEffect, useState } from "react";
import { ChatHistory, formatOpenAIMessageContentIntoString } from "../Chat";

export interface ChatHistoryMetadata {
  id: string;
  displayName: string;
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
    setChatHistoriesMetadata(
      allChatHistories.map((chat) => ({
        id: chat.id,
        displayName: getChatName(chat),
      }))
    );

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

const getChatName = (chat: ChatHistory): string => {
  const actualHistory = chat.displayableChatHistory;

  if (
    actualHistory.length === 0 ||
    !actualHistory[actualHistory.length - 1].content
  ) {
    return "Empty Chat";
  }

  const lastMsg = actualHistory[0];

  if (lastMsg.visibleContent) {
    return lastMsg.visibleContent.slice(0, 30);
  }

  const lastMessage = formatOpenAIMessageContentIntoString(lastMsg.content);
  if (!lastMessage || lastMessage === "") {
    return "Empty Chat";
  }
  return lastMessage.slice(0, 30);
};
