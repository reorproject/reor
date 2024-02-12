import React, { useState } from "react";
import Modal from "../Generic/Modal";
// import Modal from './Modal'; // Adjust the import path as necessary
import { Button } from "@material-tailwind/react";

interface NewNoteComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (path: string) => void;
  windowVaultDirectory: string;
}

const NewNoteComponent: React.FC<NewNoteComponentProps> = ({
  isOpen,
  onClose,
  onFileSelect,
  windowVaultDirectory,
}) => {
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // const [isValidName, setIsValidName] = useState<boolean>(true);

  const validNamePattern = /^[a-zA-Z0-9_\-/\s]+$/;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName === "") {
      setFileName(newName);
      setErrorMessage("");
    } else if (validNamePattern.test(newName) && !newName.includes("../")) {
      setFileName(newName);
      setErrorMessage("");
    } else {
      setFileName(newName);
      setErrorMessage(
        "Note name can only contain letters, numbers, underscores, hyphens, and slashes."
      );
    }
  };

  const sendNewNoteMsg = async () => {
    if (!fileName || errorMessage) {
      return;
    }
    // Normalize the path separators to forward slashes
    const normalizedFileName = fileName.replace(/\\/g, "/");
    const fullPath = await window.files.joinPath(
      windowVaultDirectory,
      normalizedFileName + ".md"
    );
    // Create directories if they don't exist
    // await window.files.ensureDirectoryExists(fullPath);
    window.files.createFile(fullPath, "");
    onFileSelect(fullPath);
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendNewNoteMsg();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-3 mr-6 mt-2 mb-2 h-full min-w-[400px]">
        <h2 className="text-xl font-semibold mb-3 text-white">New Note</h2>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={fileName}
          // onChange={(e) => setFileName(e.target.value)}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="Note Name"
        />

        <Button
          className="bg-slate-700 mt-3 mb-2 border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
          onClick={sendNewNoteMsg}
          placeholder=""
        >
          Create
        </Button>
        {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}
      </div>
    </Modal>
  );
};

export default NewNoteComponent;

// function appendExtensionIfMissing(filename: string, extensions: string[]): string {
//   // Check if the filename ends with any of the provided extensions
//   const hasExtension = extensions.some(ext => filename.endsWith(ext));

//   // If the filename already has one of the extensions, return it as is
//   if (hasExtension) {
//       return filename;
//   }

//   // If not, append the first extension from the list to the filename
//   return filename + extensions[0];
// }
