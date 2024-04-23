import React from "react";
import { ChatHistory } from "./Chat";

interface ChatListProps {
  chatIDs: string[];
  currentChatHistory: ChatHistory | undefined;
  onSelect: (chatID: string) => void;
  newChat: () => void;
}

export const ChatsSidebar: React.FC<ChatListProps> = ({
  chatIDs,
  currentChatHistory,
  onSelect,
  newChat,
}) => {
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
      {chatIDs.map((chatID) => (
        <ChatItem
          key={chatID}
          chatID={chatID}
          selectedChatID={currentChatHistory?.id || ""}
          onChatSelect={onSelect}
        />
      ))}
    </div>
  );
};

interface ChatItemProps {
  chatID: string;
  selectedChatID: string | null;
  onChatSelect: (path: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chatID,
  selectedChatID,
  onChatSelect,
}) => {
  const isSelected = chatID === selectedChatID;

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 ${
    isSelected ? "bg-neutral-700 text-white font-semibold" : "text-gray-200"
  }`;

  return (
    <div>
      <div onClick={() => onChatSelect(chatID)} className={itemClasses}>
        <span className={`text-[13px] flex-1 truncate mt-0`}>{chatID}</span>
      </div>
    </div>
  );
};
