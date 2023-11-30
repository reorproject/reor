import React, { useEffect, useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [openAIKey, setOpenAIKey] = useState("");

  useEffect(() => {
    const key = window.electronStore.getOpenAIAPIKey() || ""; // Fallback to empty string if undefined
    setOpenAIKey(key);
  }, []);

  const handleSave = () => {
    window.electronStore.setOpenAIAPIKey(openAIKey);
    onClose();
  };

  if (!isOpen) return null;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-2 mr-6 mt-0 h-full min-w-[400px]">
        <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2>
        <h4 className="font-semibold mb-2 text-white">Embedding Model</h4>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
          value={"BAAI/bge-base-en-v1.5"}
          disabled
          placeholder="Embedding Model"
        />
        <h4 className="font-semibold mb-2 text-white">LLM</h4>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
          value={"GPT-3.5-turbo"}
          disabled
          placeholder="LLM Model"
        />
        <h4 className="font-semibold mb-2 text-white">Open AI Key</h4>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Open AI API Key"
        />

        <Button
          className="bg-slate-700 mt-4 border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
          onClick={handleSave}
        >
          Save
        </Button>
        <p className="text-xs text-white">
          *Models are currently pre-set. Custom models are coming very soon :)
        </p>
      </div>
    </Modal>
  );
};

export default SettingsModal;
