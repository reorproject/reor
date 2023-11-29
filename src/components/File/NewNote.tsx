import React, { useState } from "react";
import Modal from "../Generic/Modal";
// import Modal from './Modal'; // Adjust the import path as necessary

interface NewNoteComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (path: string) => void;
}

const NewNoteComponent: React.FC<NewNoteComponentProps> = ({
  isOpen,
  onClose,
  onFileSelect,
}) => {
  const [fileName, setFileName] = useState<string>("");

  const sendNewNoteMsg = async () => {
    const notePath = await window.files.joinPath(
      window.electronStore.getUserDirectory(),
      fileName
    );
    console.log("NEW NOTE PATH: ", notePath);
    window.files.createFile(notePath, "");
    onFileSelect(notePath);
    onClose(); // Close modal after file creation
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendNewNoteMsg();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="mr-6">
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Create New Note
        </h2>
        <input
          type="text"
          className="form-input block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Note Name"
        />
        <button
          onClick={sendNewNoteMsg}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Create
        </button>
      </div>
    </Modal>
  );
};

export default NewNoteComponent;
