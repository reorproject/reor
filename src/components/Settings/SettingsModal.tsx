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

        <Button
          className="mt-2 border-none h-10 hover:bg-slate-800 cursor-pointer"
          onClick={handleSave}
        >
          Save Key
        </Button>
      </div>
    </Modal>
  );
};

export default SettingsModal;
