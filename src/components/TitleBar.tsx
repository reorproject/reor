import NewNoteComponent from "./File/NewNote";
import { useEffect, useState } from "react";
import { PiSidebar } from "react-icons/pi";

import { BsChatLeftDots, BsFillChatLeftDotsFill } from "react-icons/bs";
import { SidebarAbleToShow } from "./FileEditorContainer";

export const titleBarHeight = "30px";
interface TitleBarProps {
  onFileSelect: (path: string) => void;
  chatbotOpen: boolean;
  toggleChatbot: () => void;
  toggleSimilarFiles: () => void;
  makeSidebarShow: (show: SidebarAbleToShow) => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  chatbotOpen,
  toggleChatbot,
  toggleSimilarFiles,
  // makeSidebarShow,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const fetchPlatform = async () => {
      const response = await window.electron.getPlatform();
      setPlatform(response);
    };

    fetchPlatform();
  }, []);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <div
      id="customTitleBar"
      className={`h-titlebar bg-gray-900 flex justify-between`}
    >
      <div
        className=" flex"
        style={
          platform === "darwin"
            ? { marginLeft: "70px" }
            : { marginLeft: "10px" }
        }
      >
        {/* <button className="bg-transparent border-none cursor-pointer">
        <MdSearch className="text-gray-600" size={24} />
      </button> */}
        {/* <div className="mt-[0.3rem]" onClick={() => makeSidebarShow("files")}>
          <IoFolderOutline className="text-gray-200 cursor-pointer" size={22} />
        </div>
        <div
          className="ml-[12px] mt-[2.2px]"
          onClick={() => makeSidebarShow("search")}
        >
          <FaSearch
            size={18}
            className="mt-[4.2px] cursor-pointer text-gray-200"
            // onClick={() => setShowSearch(true)}
          />
        </div> */}
        {/* <button
          className="bg-transparent border-none cursor-pointer ml-[6px]"
          onClick={toggleModal}
        >
          <FaRegPenToSquare className="text-gray-200" size={20} />
        </button> */}

        <NewNoteComponent
          isOpen={isModalOpen}
          onClose={toggleModal}
          onFileSelect={onFileSelect}
        />
      </div>

      <div
        className="flex justify-content-right align-items-right"
        style={platform === "win32" ? { marginRight: "8.5rem" } : {}}
      >
        {/* <button
          className="bg-transparent border-none cursor-pointer mr-0 bg-blue-300"
          onClick={() => {
            toggleSimilarFiles();
            toggleChatbot();
          }}
        > */}
        <PiSidebar
          className="text-gray-100 cursor-pointer mt-[0.1rem]"
          size={28}
          onClick={toggleSimilarFiles}
        />
        {/* <div className="pt-[1px] mt-[1px] pb-[1px]  ml-[0.3rem] h-[90%]">
          <SimilarFilesButton onClick={toggleSimilarFiles} />
        </div> */}
        <div className="mt-[0.33rem] mr-[0.5rem] ml-[0.3rem]">
          {/* <ChatButton onClick={toggleChatbot} /> */}
          {chatbotOpen ? (
            <BsFillChatLeftDotsFill
              size={22}
              className="text-gray-100 cursor-pointer"
              onClick={toggleChatbot}
            />
          ) : (
            <BsChatLeftDots
              className="text-gray-100 cursor-pointer "
              size={22}
              onClick={toggleChatbot}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TitleBar;

import React from "react";

// type ChatButtonProps = {
//   onClick: () => void; // You can define the type of your onClick function more precisely if needed
// };

// const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
//   return (
//     <button
//       onClick={onClick}
//       className=" bg-gray-200 h-full rounded-lg hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 border border-gray-400  shadow inline-flex items-center"
//     >
//       <BsFillChatLeftDotsFill
//         size={19}
//         className=" cursor-pointer mr-2 mt-[1px]"
//         // onClick={toggleChatbot}
//       />
//       <span>Chat</span>
//     </button>
//   );
// };

// type SimilarFilesButtonProps = {
//   onClick: () => void; // You can define the type of your onClick function more precisely if needed
// };

// const SimilarFilesButton: React.FC<SimilarFilesButtonProps> = ({ onClick }) => {
//   return (
//     <button
//       onClick={onClick}
//       className=" bg-gray-200 h-full rounded-lg hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 border border-gray-400 rounded shadow inline-flex items-center"
//     >
//       <PiSidebar
//         size={19}
//         className=" cursor-pointer mr-2 mt-[1px]"
//         // onClick={toggleChatbot}
//       />
//       <span>Related</span>
//     </button>
//   );
// };
