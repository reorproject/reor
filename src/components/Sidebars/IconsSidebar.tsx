import React, { useState } from "react";
import SettingsModal from "../Settings/Settings";
import { MdSettings } from "react-icons/md"; // Importing Material Design settings icon
// import { FaRegPenToSquare } from "react-icons/fa6";
import { SidebarAbleToShow } from "../FileEditorContainer";
import { IoFolderOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import NewNoteComponent from "../File/NewNote";
import { PiFolderPlusDuotone } from "react-icons/pi";
import { HiFolderPlus } from "react-icons/hi2";
import NewDirectoryComponent from "../File/NewDirectory";

interface LeftSidebarProps {
  onFileSelect: (path: string) => void;
  // chatbotOpen: boolean;
  // toggleChatbot: () => void;
  // toggleSimilarFiles: () => void;
  sidebarShowing: SidebarAbleToShow;
  makeSidebarShow: (show: SidebarAbleToShow) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onFileSelect,
  sidebarShowing,
  makeSidebarShow,
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false);
  // const toggleModal = () => {
  //   setIsNewNoteModalOpen(!isNewNoteModalOpen);
  // };
  return (
    <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-between">
      <div
        className=" flex items-center justify-center w-full h-8 cursor-pointer"
        onClick={() => makeSidebarShow("files")}
      >
        <div
          className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-slate-700"
          style={{
            backgroundColor: sidebarShowing === "files" ? "#334155" : "",
          }}
        >
          <IoFolderOutline className="mx-auto text-gray-200 " size={22} />
        </div>
      </div>
      {/* )} */}
      {/* {sidebarShowing !== "search" && ( */}
      <div
        className="flex items-center justify-center w-full h-8  cursor-pointer"
        // style={{
        //   backgroundColor: sidebarShowing === "search" ? "#334155" : "",
        // }}
        onClick={() => makeSidebarShow("search")}
      >
        <div
          className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-slate-700"
          style={{
            backgroundColor: sidebarShowing === "search" ? "#334155" : "",
          }}
        >
          <FaSearch size={18} className=" text-gray-200" />
        </div>
      </div>
      {/* )} */}
      <div
        className="bg-transparent border-none cursor-pointer flex items-center justify-center w-full h-8 "
        onClick={() => setIsNewNoteModalOpen(true)}
      >
        <div
          className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-slate-700"
          // style={{
          //   backgroundColor: sidebarShowing === "search" ? "#334155" : "",
          // }}
        >
          <FaRegPenToSquare className="text-gray-200" size={20} />
        </div>
      </div>
      <div
        className="bg-transparent border-none cursor-pointer flex items-center justify-center w-full h-8 mt-1"
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div
          className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-slate-700"
          // style={{
          //   backgroundColor: sidebarShowing === "search" ? "#334155" : "",
          // }}
        >
          <HiFolderPlus className="text-gray-200" size={25} />
          {/* <FaRegPenToSquare className="text-gray-200" size={20} /> */}
        </div>
      </div>
      <NewNoteComponent
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        onFileSelect={onFileSelect}
      />
      <NewDirectoryComponent
        isOpen={isNewDirectoryModalOpen}
        onClose={() => setIsNewDirectoryModalOpen(false)}
        onDirectoryCreate={() => console.log("Directory created")}
      />
      <div className="flex-grow border-1 border-yellow-300"></div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      <button
        className="bg-transparent border-none pb-2 cursor-pointer flex items-center justify-center w-full"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
      >
        <MdSettings className="h-6 w-6 text-gray-100" />
      </button>
    </div>
  );
};

export default LeftSidebar;
