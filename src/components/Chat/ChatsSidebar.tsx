import React from "react";

interface ChatListProps {
  chatIDs: string[];
  onSelect: (chatID: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ chatIDs, onSelect }) => {
  return (
    <div className="h-full overflow-y-auto bg-neutral-800">
      {chatIDs.map((chatID) => (
        <ChatItem
          key={chatID}
          chatID={chatID}
          selectedChatID={null} // Pass null or manage this state internally if needed
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
