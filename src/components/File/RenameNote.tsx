import React, { useEffect, useState } from "react";

import { Button } from "@material-tailwind/react";
import { toast } from "react-toastify";

import ReorModal from "../Common/Modal";

import { errorToStringRendererProcess } from "@/utils/error";
import {
  getInvalidCharacterInFileName,
  removeFileExtension,
} from "@/utils/strings";

export interface RenameNoteFuncProps {
  path: string;
  newNoteName: string;
}

interface RenameNoteModalProps {
  isOpen: boolean;
  fullNoteName: string;
  onClose: () => void;
  renameNote: (props: RenameNoteFuncProps) => Promise<void>;
}

const RenameNoteModal: React.FC<RenameNoteModalProps> = ({
  isOpen,
  fullNoteName,
  onClose,
  renameNote,
}) => {
  useEffect(() => {
    const setDirectoryUponNoteChange = async () => {
      const initialNotePathPrefix = await window.path.dirname(fullNoteName);
      setDirPrefix(initialNotePathPrefix);
      const initialNoteName = await window.path.basename(fullNoteName);
      const trimmedInitialNoteName = removeFileExtension(initialNoteName) || "";
      setNoteName(trimmedInitialNoteName);
    };

    setDirectoryUponNoteChange();
  }, [fullNoteName]);

  const fileExtension = fullNoteName.split(".").pop() || "md";
  const [dirPrefix, setDirPrefix] = useState<string>("");
  const [noteName, setNoteName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setNoteName(newName);

    getInvalidCharacterInFileName(newName).then((invalidCharacter) => {
      if (invalidCharacter) {
        setErrorMessage(
          `The character [${invalidCharacter}] cannot be included in note name.`
        );
      } else {
        setErrorMessage(null);
      }
    });
  };

  const sendNoteRename = async () => {
    try {
      if (errorMessage) {
        return;
      }
      if (!noteName) {
        toast.error("Note name cannot be empty", {
          className: "mt-5",
          closeOnClick: false,
          draggable: false,
        });
        return;
      }

      // get full path of note
      await renameNote({
        path: `${fullNoteName}`,
        newNoteName: `${dirPrefix}${noteName}.${fileExtension}`,
      });
      onClose();
    } catch (e) {
      toast.error(errorToStringRendererProcess(e), {
        className: "mt-5",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendNoteRename();
    }
  };

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="ml-3 mr-6 mt-2 mb-2 h-full min-w-[400px]">
        <h2 className="text-xl font-semibold mb-3 text-white">Rename Note</h2>
        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={noteName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="New Note Name"
        />
        <Button
          className="bg-orange-700 mt-3 mb-2 border-none h-10 hover:bg-orange-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
          onClick={sendNoteRename}
          placeholder={""}
        >
          Rename
        </Button>
        {errorMessage && <p className="text-red-500 text-xs">{errorMessage}</p>}
      </div>
    </ReorModal>
  );
};

export default RenameNoteModal;
