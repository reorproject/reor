import React from "react";

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
      ></div>

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
