import { useEffect, useState } from "react";
import { ChatFilters, ChatHistory, formatOpenAIMessageContentIntoString } from "../Chat";
import { DBQueryResult } from "electron/main/database/Schema";

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
  const [currentChatContext, setCurrentChatContext] = useState<DBQueryResult[]>([]);
  const [chatFilters, setChatFilters] = useState<ChatFilters>({
    files: [],
    numberOfChunksToFetch: 15,
  });
  const [chatFilePath, setChatFilePath] = useState<string | null>(null);

  const fetchChatHistories = async () => {
    let allChatHistories = await window.electronStore.getAllChatHistories();
    if (!allChatHistories) {
      allChatHistories = [];
    }
    setAllChatHistories(allChatHistories);
    setChatHistoriesMetadata(
      allChatHistories.map((chat) => ({
        id: chat.id,
        displayName: getDisplayableChatName(chat),
      }))
    );

    setCurrentChatHistory(undefined);
  };

  useEffect(() => {
    fetchChatHistories();
  }, []);

  const handleSetChatFilePath = async (path: string) => {
    setChatFilePath(path);
    const content = await window.files.readFile(path || "");
    setCurrentChatContext([{
      content: content,
      filemodified: new Date(),
      filecreated: new Date(),
      notepath: path,
      subnoteindex: 0,
      timeadded: new Date(),
      _distance: 0
    }]);
    // add file as context to the chat filters
    setChatFilters({ ...chatFilters, files: [path]});
  }

  return {
    chatFilePath,
    setChatFilePath,
    allChatHistories,
    setAllChatHistories,
    currentChatHistory,
    setCurrentChatHistory,
    chatHistoriesMetadata,
    setChatHistoriesMetadata,
    currentChatContext,
    setCurrentChatContext,
    chatFilters,
    setChatFilters,
    handleSetChatFilePath,
  };
};

export const getDisplayableChatName = (chat: ChatHistory): string => {
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

export const getChatHistoryContext = (
  chatHistory: ChatHistory | undefined
): DBQueryResult[] => {
  if (!chatHistory) return [];
  console.log("chatHistory", chatHistory.displayableChatHistory);

  const contextForChat = chatHistory.displayableChatHistory
    .map((message) => {
      return message.context;
    })
    .flat();
  return contextForChat as DBQueryResult[];
};
