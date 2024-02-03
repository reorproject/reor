import React, { useState } from "react";
import SettingsModal from "../Settings/Settings";
import { MdSettings } from "react-icons/md"; // Importing Material Design settings icon
// import { FaRegPenToSquare } from "react-icons/fa6";
import { SidebarAbleToShow } from "../FileEditorContainer";
import { IoFolderOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";

interface LeftSidebarProps {
  // onFileSelect: (path: string) => void;
  // chatbotOpen: boolean;
  // toggleChatbot: () => void;
  // toggleSimilarFiles: () => void;
  sidebarShowing: SidebarAbleToShow;
  makeSidebarShow: (show: SidebarAbleToShow) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  sidebarShowing,
  makeSidebarShow,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="w-full h-full bg-gray-800 flex flex-col justify-between">
      {/* {sidebarShowing !== "files" && ( */}
      <div
        className="hover:bg-slate-600"
        onClick={() => makeSidebarShow("files")}
      >
        <IoFolderOutline
          className="mx-auto text-gray-200 cursor-pointer"
          size={22}
        />
      </div>
      {/* )} */}
      {/* {sidebarShowing !== "search" && ( */}
      <div className="" onClick={() => makeSidebarShow("search")}>
        <FaSearch
          size={18}
          className="cursor-pointer text-gray-200"
          // onClick={() => setShowSearch(true)}
        />
      </div>
      {/* )} */}
      {/* <button
        className="bg-transparent border-none cursor-pointer mt-2 ml-[6px]"
        // onClick={toggleModal}
      >
        <FaRegPenToSquare className="text-gray-200" size={20} />
      </button> */}
      <div className="flex-grow border-1 border-yellow-300"></div>
      <SettingsModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      <button
        className="bg-transparent border-none pb-2 cursor-pointer"
        onClick={() => setModalOpen(!isModalOpen)}
      >
        <MdSettings className="h-6 w-6 text-gray-100" />
      </button>
    </div>
  );
};

export default LeftSidebar;
