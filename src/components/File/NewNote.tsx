import React, { useState } from "react";

interface NewNoteComponentProps {
  onFileSelect: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NewNoteComponent: React.FC<NewNoteComponentProps> = ({
  onFileSelect,
  isOpen,
  onClose,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendNewNoteMsg();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-smoke-light flex">
      <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
        <span className="absolute top-0 right-0 p-4" onClick={onClose}>
          [Close]
        </span>
        <input
          type="text"
          className="border border-gray-300 rounded-md p-2 w-full"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Name"
        />
        <button
          onClick={sendNewNoteMsg}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default NewNoteComponent;
