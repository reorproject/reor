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

  const fileExtension = fullNoteName.split(".").pop() ?? "md";
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
        path: fullNoteName,
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
      <div className="my-2 ml-3 mr-6 h-full min-w-[400px]">
        <h2 className="mb-3 text-xl font-semibold text-white">Rename Note</h2>
        <input
          type="text"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={noteName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="New Note Name"
        />
        <Button
          className="mb-2 mt-3 h-10 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
          onClick={sendNoteRename}
          placeholder={""}
        >
          Rename
        </Button>
        {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
      </div>
    </ReorModal>
  );
};

export default RenameNoteModal;
