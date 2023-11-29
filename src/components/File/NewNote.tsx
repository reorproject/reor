import React, { useState } from "react";
import Modal from "../Generic/Modal";
// import Modal from './Modal'; // Adjust the import path as necessary
import { Button } from "@material-tailwind/react";

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
      <div className="ml-2 mr-6 mt-0 h-full min-w-[400px]">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Create New Note
        </h2>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Note Name"
        />
        <Button
          className="bg-slate-700 mt-2 border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
          onClick={sendNewNoteMsg}
        >
          Create
        </Button>
      </div>
    </Modal>
  );
};

export default NewNoteComponent;
