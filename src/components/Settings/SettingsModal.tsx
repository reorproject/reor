import React, { useEffect, useState } from "react";
import Modal from "../Generic/Modal";

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className=" text-white rounded-lg p-5">
        <h2 className="text-xl mb-4">OpenAI Key Settings</h2>
        <input
          type="password" // Changed to password type
          className="w-full p-2 text-black"
          placeholder="Enter your OpenAI Key"
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
        />
        <button
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSave}
        >
          Save Key
        </button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
