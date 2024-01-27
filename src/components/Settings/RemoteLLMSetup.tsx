import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../Generic/Modal";

interface RemoteLLMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RemoteLLMModal: React.FC<RemoteLLMModalProps> = ({ isOpen, onClose }) => {
  const [openAIKey, setOpenAIKey] = useState("");

  useEffect(() => {
    const key = window.electronStore.getOpenAIAPIKey() || ""; // Fallback to empty string if undefined
    setOpenAIKey(key);
  }, []);

  const handleSave = () => {
    window.electronStore.setOpenAIAPIKey(openAIKey);

    onClose();
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleSave}>
      <div className="w-[300px] ml-3 mr-2 mb-2">
        <h2 className="font-semibold mb-0 text-white">Remote LLM Setup</h2>
        <p className="text-gray-100 mb-2 mt-2 text-sm">
          Enter your OpenAI API key below to enable OpenAI models in the
          Chatbot:
        </p>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Open AI API Key"
        />
        <p className="mt-2 text-gray-100 text-xs">
          <i>
            You can then choose an OpenAI model in the Default Models dropdown.
          </i>
        </p>
        <Button
          className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer text-center pt-0 pb-0 pr-2 pl-2 mt-1 w-[80px]"
          onClick={handleSave}
          placeholder=""
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default RemoteLLMModal;
