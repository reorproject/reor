import React from "react";
import { ChatHistory, formatOpenAIMessageContentIntoString } from "./Chat";

interface ChatListProps {
  chatHistories: ChatHistory[];
  currentChatHistory: ChatHistory | undefined;
  onSelect: (chatID: string) => void;
  newChat: () => void;
}

export const ChatsSidebar: React.FC<ChatListProps> = ({
  chatHistories,
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
      {chatHistories.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          selectedChatID={currentChatHistory?.id || ""}
          onChatSelect={onSelect}
        />
      ))}
    </div>
  );
};

interface ChatItemProps {
  chat: ChatHistory;
  selectedChatID: string | null;
  onChatSelect: (path: string) => void;
}

export const ChatItem: React.FC<ChatItemProps> = ({
  chat,
  selectedChatID,
  onChatSelect,
}) => {
  const isSelected = chat.id === selectedChatID;

  const itemClasses = `flex items-center cursor-pointer px-2 py-1 border-b border-gray-200 hover:bg-neutral-700 h-full mt-0 mb-0 ${
    isSelected ? "bg-neutral-700 text-white font-semibold" : "text-gray-200"
  }`;

  return (
    <div>
      <div onClick={() => onChatSelect(chat.id)} className={itemClasses}>
        <span className={`text-[13px] flex-1 truncate mt-0`}>
          {getChatName(chat)}
        </span>
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

  const lastMsg = actualHistory[actualHistory.length - 1];

  if (lastMsg.visibleContent) {
    return lastMsg.visibleContent.slice(0, 30);
  }

  const lastMessage = formatOpenAIMessageContentIntoString(lastMsg.content);
  if (!lastMessage || lastMessage === "") {
    return "Empty Chat";
  }
  return lastMessage.slice(0, 30);
};
