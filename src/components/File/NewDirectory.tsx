import React, { useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import { errorToString } from "@/functions/error";
import { toast } from "react-toastify";
import { getInvalidCharacterInFileName } from "@/functions/strings";

interface NewDirectoryComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectoryCreate: (path: string) => void;
}

const NewDirectoryComponent: React.FC<NewDirectoryComponentProps> = ({
  isOpen,
  onClose,
  onDirectoryCreate,
}) => {
  const [directoryName, setDirectoryName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setDirectoryName(newName);

    getInvalidCharacterInFileName(newName).then((invalidCharacter) => {
      if (invalidCharacter) {
        setErrorMessage(
          `The character [${invalidCharacter}] cannot be included in directory name.`
        );
      } else {
        setErrorMessage(null);
      }
    });
  };

  const sendNewDirectoryMsg = async () => {
    try {
      if (!directoryName || errorMessage) {
        return;
      }
      const normalizedDirectoryName = directoryName.replace(/\\/g, "/");
      const fullPath = window.path.join(
        window.electronStore.getVaultDirectory(),
        normalizedDirectoryName
      );
      window.files.createDirectory(fullPath);
      onDirectoryCreate(fullPath);
      onClose();
    } catch (e) {
      toast.error(errorToString(e), {
        className: "mt-5",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendNewDirectoryMsg();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="ml-3 mr-6 mt-2 mb-2 h-full min-w-[400px]">
        <h2 className="text-xl font-semibold mb-3 text-white">New Directory</h2>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={directoryName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="Directory Name"
        />
        <Button
          className="bg-orange-700 mt-3 mb-2 border-none h-10 hover:bg-orange-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
          onClick={sendNewDirectoryMsg}
          placeholder={""}
        >
          Create
        </Button>
        {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}
      </div>
    </Modal>
  );
};

export default NewDirectoryComponent;
