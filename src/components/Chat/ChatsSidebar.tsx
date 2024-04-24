import React, { useEffect, useState } from "react";
import { ChatHistory, formatOpenAIMessageContentIntoString } from "./Chat";
import { ChatHistoryMetadata } from "./hooks/use-chat-history";

interface ChatListProps {
  // chatHistories: ChatHistory[];
  chatHistoriesMetadata: ChatHistoryMetadata[];
  currentChatHistory: ChatHistory | undefined;
  onSelect: (chatID: string) => void;
  newChat: () => void;
}

export const ChatsSidebar: React.FC<ChatListProps> = ({
  chatHistoriesMetadata,
  currentChatHistory,
  onSelect,
  newChat,
}) => {
  const [localChatHistoriesMetadata, setLocalChatHistoriesMetadata] = useState<
    ChatHistoryMetadata[]
  >([]);
  useEffect(() => {
    setLocalChatHistoriesMetadata(chatHistoriesMetadata.reverse());
  }, [chatHistoriesMetadata]);
  return (
    <div className="h-full overflow-y-auto bg-neutral-800">
      <div
        className="flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0"
        onClick={newChat}
      >
        <span className="text-[13px] flex-1 truncate mt-0 text-slate-300">
          New Chat
        </span>
      </div>
      {localChatHistoriesMetadata.map((chat) => (
        <ChatItem
          key={chat.id}
          // chat={chat}
          id={chat.id}
          selectedChatID={currentChatHistory?.id || ""}
          onChatSelect={onSelect}
        />
      ))}
    </div>
  );
};

interface ChatItemProps {
  id: string;
  selectedChatID: string | null;
  onChatSelect: (path: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  id,
  selectedChatID,
  onChatSelect,
}) => {
  const isSelected = id === selectedChatID;

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 ${
    isSelected ? "bg-neutral-700 text-white font-semibold" : "text-gray-200"
  }`;

  return (
    <div>
      <div onClick={() => onChatSelect(id)} className={itemClasses}>
        <span className={`text-[13px] flex-1 truncate mt-0`}>{id}</span>
      </div>
    </div>
  );
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
