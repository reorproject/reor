import React, { useEffect, useState } from "react";

import { BsChatLeftDots, BsFillChatLeftDotsFill } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { GrNewWindow } from "react-icons/gr";
import { IoFolderOutline } from "react-icons/io5";
import { LuFolderPlus } from "react-icons/lu";
import { MdOutlineQuiz, MdSettings } from "react-icons/md";

import NewDirectoryComponent from "../File/NewDirectory";
import NewNoteComponent from "../File/NewNote";
import { SidebarAbleToShow } from "../FileEditorContainer";
import FlashcardMenuModal from "../Flashcard/FlashcardMenuModal";
import SettingsModal from "../Settings/Settings";

interface IconsSidebarProps {
  openRelativePath: (path: string) => void;
  sidebarShowing: SidebarAbleToShow;
  makeSidebarShow: (show: SidebarAbleToShow) => void;
  filePath: string | null;
}

const IconsSidebar: React.FC<IconsSidebarProps> = ({
  openRelativePath,
  sidebarShowing,
  makeSidebarShow,
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false);
  const [isFlashcardModeOpen, setIsFlashcardModeOpen] = useState(false);

  const [initialFileToCreateFlashcard, setInitialFileToCreateFlashcard] =
    useState("");
  const [initialFileToReviewFlashcard, setInitialFileToReviewFlashcard] =
    useState("");

  // open a new flashcard create mode
  useEffect(() => {
    const createFlashcardFileListener = window.ipcRenderer.receive(
      "create-flashcard-file-listener",
      (noteName: string) => {
        setIsFlashcardModeOpen(!!noteName);
        setInitialFileToCreateFlashcard(noteName);
      }
    );

    return () => {
      createFlashcardFileListener();
    };
  }, []);

  return (
    <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-between">
      <div
        className=" flex items-center justify-center w-full h-8 cursor-pointer"
        onClick={() => makeSidebarShow("files")}
      >
        <div
          className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700"
          style={{
            backgroundColor: sidebarShowing === "files" ? "rgb(82 82 82)" : "",
          }}
        >
          <IoFolderOutline
            className="mx-auto text-gray-200 "
            size={22}
            title="Files"
          />
        </div>
      </div>
      <div
        className=" flex items-center justify-center w-full h-8 cursor-pointer"
        onClick={() => makeSidebarShow("chats")}
      >
        <div
          className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700"
          style={{
            backgroundColor: sidebarShowing === "chats" ? "rgb(82 82 82)" : "",
          }}
        >
          {sidebarShowing === "chats" ? (
            <BsFillChatLeftDotsFill
              size={22}
              className="text-gray-100 cursor-pointer"
              title="Open Chatbot"
            />
          ) : (
            <BsChatLeftDots
              className="text-gray-100 cursor-pointer "
              size={22}
              title="Close Chatbot"
            />
          )}
        </div>
      </div>
      <div
        className="flex items-center justify-center w-full h-8 cursor-pointer"
        onClick={() => makeSidebarShow("search")}
      >
        <div
          className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700"
          style={{
            backgroundColor: sidebarShowing === "search" ? "rgb(82 82 82)" : "",
          }}
        >
          <FaSearch
            size={18}
            className=" text-gray-200"
            title="Semantic Search"
          />
        </div>
      </div>
      <div
        className="bg-transparent border-none cursor-pointer flex items-center justify-center w-full h-8 "
        onClick={() => setIsNewNoteModalOpen(true)}
      >
        <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
          <FaRegPenToSquare
            className="text-gray-200"
            size={20}
            title="New Note"
          />
        </div>
      </div>
      <div
        className="bg-transparent mt-[2px] border-none cursor-pointer flex items-center justify-center w-full h-8 "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
          <LuFolderPlus
            className="text-gray-200"
            size={23}
            title="New Directory"
          />
          {/* < /> */}
        </div>
      </div>
      <div
        className="bg-transparent border-none cursor-pointer flex items-center justify-center w-full h-8 "
        onClick={() => setIsFlashcardModeOpen(true)}
      >
        <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
          <MdOutlineQuiz
            className="text-gray-200"
            size={23}
            title="Flashcard quiz"
          />
          {/* < /> */}
        </div>
      </div>

      <NewNoteComponent
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        openRelativePath={openRelativePath}
      />
      <NewDirectoryComponent
        isOpen={isNewDirectoryModalOpen}
        onClose={() => setIsNewDirectoryModalOpen(false)}
        onDirectoryCreate={() => console.log("Directory created")}
      />
      {isFlashcardModeOpen && (
        <FlashcardMenuModal
          isOpen={isFlashcardModeOpen}
          onClose={() => {
            setIsFlashcardModeOpen(false);
            setInitialFileToCreateFlashcard("");
            setInitialFileToReviewFlashcard("");
          }}
          initialFileToCreateFlashcard={initialFileToCreateFlashcard}
          initialFileToReviewFlashcard={initialFileToReviewFlashcard}
        />
      )}
      <div className="flex-grow border-1 border-yellow-300"></div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <div
        className="bg-transparent border-none pb-2 mb-[2px] cursor-pointer flex items-center justify-center w-full"
        onClick={() => window.electron.openNewWindow()}
      >
        <GrNewWindow
          className="text-gray-100"
          size={21}
          title="Open New Vault"
        />
      </div>
      <button
        className="bg-transparent border-none pb-2 cursor-pointer flex items-center justify-center w-full"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
      >
        <MdSettings className="h-6 w-6 text-gray-100" title="Settings" />
      </button>
    </div>
  );
};

export default IconsSidebar;
