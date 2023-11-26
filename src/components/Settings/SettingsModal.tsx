import React, { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onSaveKey: (key: string) => void;
}

const SettingsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  // onSaveKey,
}) => {
  const [openAIKey, setOpenAIKey] = useState("");

  useEffect(() => {
    const key = window.electronStore.getOpenAIAPIKey() || ""; // Fallback to empty string if undefined
    setOpenAIKey(key);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    // onSaveKey(openAIKey);
    window.electronStore.setOpenAIAPIKey(openAIKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-gray-800 text-white rounded-lg shadow-xl p-5">
        <button
          className="float-right text-gray-400 hover:text-gray-200"
          onClick={handleSave}
        >
          &#10005; {/* This is a simple 'X' close icon */}
        </button>
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
    </div>
  );
};

export default SettingsModal;
