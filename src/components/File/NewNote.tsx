import React, { useState, useRef, useEffect } from "react";

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
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOffClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOffClick);
    return () => {
      document.removeEventListener("mousedown", handleOffClick);
    };
  }, [onClose]);

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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Create New Note</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            <span className="text-3xl">&times;</span>
          </button>
        </div>
        <input
          type="text"
          className="form-input mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Note Name"
        />
        <button
          onClick={sendNewNoteMsg}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default NewNoteComponent;
