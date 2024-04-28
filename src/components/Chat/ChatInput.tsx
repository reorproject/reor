import React, { useEffect } from "react";
import { CircularProgress } from "@mui/material";
import Textarea from "@mui/joy/Textarea";
import { ChatFilters } from "./Chat";
interface ChatInputProps {
  userTextFieldInput: string;
  setUserTextFieldInput: (value: string) => void;
  handleSubmitNewMessage: () => void;
  loadingResponse: boolean;
  askText: string;
  chatFilters: ChatFilters | undefined;
  setChatFilters: (chatFilters: ChatFilters) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  userTextFieldInput,
  setUserTextFieldInput,
  handleSubmitNewMessage,
  loadingResponse,
  askText,
  chatFilters,
  setChatFilters,
}) => {
  return (
    <div className="p-3 bg-neutral-600">
      <div className="flex h-full">
        <FilterComponent
          chatFilters={chatFilters}
          setChatFilters={setChatFilters}
        />
        <Textarea
          onKeyDown={(e) => {
            if (!e.shiftKey && e.key === "Enter") {
              e.preventDefault();
              handleSubmitNewMessage();
            }
          }}
          onChange={(e) => setUserTextFieldInput(e.target.value)}
          value={userTextFieldInput}
          className="w-full mr-2 bg-gray-300"
          name="Outlined"
          placeholder="Ask your knowledge..."
          variant="outlined"
          style={{
            backgroundColor: "rgb(64 64 64)",
            color: "rgb(212 212 212)",
          }}
        />
        <div className="flex justify-center items-center h-full">
          {loadingResponse ? (
            <CircularProgress
              size={32}
              thickness={20}
              style={{ color: "rgb(209 213 219 / var(--tw-bg-opacity))" }}
              className="color-gray-500"
            />
          ) : (
            <button
              aria-expanded="false"
              aria-haspopup="menu"
              className={`align-middle select-none font-sans font-bold transition-all w-[85px]
                  text-xs py-3 px-6 rounded text-white shadow-md shadow-gray-900/10
                  hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85]
                  active:shadow-none bg-neutral-700 border-none h-full hover:bg-neutral-900 cursor-pointer text-center
                  pt-0 pb-0 pr-2 pl-2`}
              type="button"
              onClick={() => handleSubmitNewMessage()}
            >
              {askText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;

interface FilterComponentProps {
  chatFilters: ChatFilters | undefined;
  setChatFilters: (chatFilters: ChatFilters) => void;
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  chatFilters,
  setChatFilters,
}) => {

  return <div className="flex space-x-2"></div>;
};
