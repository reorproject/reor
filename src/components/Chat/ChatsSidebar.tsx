import React, { useEffect, useState } from "react";
import { ChatHistory } from "./Chat";
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
        className="mt-1 mb-[1px] mr-1 ml-1 flex items-center justify-center cursor-pointer px-4 py-[2px] bg-neutral-600 hover:bg-neutral-700 text-white border border-transparent hover:border-white rounded transition duration-150 ease-in-out"
        onClick={newChat}
      >
        <span className="text-sm">New Chat</span>
      </div>

      {localChatHistoriesMetadata.map((chatMetadata) => (
        <ChatItem
          key={chatMetadata.id}
          // chat={chat}
          chatMetadata={chatMetadata}
          selectedChatID={currentChatHistory?.id || ""}
          onChatSelect={onSelect}
        />
      ))}
    </div>
  );
};

interface ChatItemProps {
  chatMetadata: ChatHistoryMetadata;
  selectedChatID: string | null;
  onChatSelect: (path: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chatMetadata,
  selectedChatID,
  onChatSelect,
}) => {
  const isSelected = chatMetadata.id === selectedChatID;

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 ${
    isSelected ? "bg-neutral-700 text-white font-semibold" : "text-gray-200"
  }`;

  return (
    <div>
      <div
        onClick={() => onChatSelect(chatMetadata.id)}
        className={itemClasses}
      >
        <span className={`text-[13px] flex-1 truncate mt-0`}>
          {chatMetadata.displayName}
        </span>
      </div>
    </div>
  );
};
