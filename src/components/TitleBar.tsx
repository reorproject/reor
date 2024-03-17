import NewNoteComponent from "./File/NewNote";
import React, { useEffect, useState } from "react";
import { PiSidebar, PiSidebarFill } from "react-icons/pi";

import { BsChatLeftDots, BsFillChatLeftDotsFill } from "react-icons/bs";

export const titleBarHeight = "30px";
interface TitleBarProps {
  onFileSelect: (path: string) => void;
  chatbotOpen: boolean;
  similarFilesOpen: boolean;
  toggleChatbot: () => void;
  toggleSimilarFiles: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  chatbotOpen,
  similarFilesOpen,
  toggleChatbot,
  toggleSimilarFiles,
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
      className={`h-titlebar bg-neutral-800 flex justify-between`}
    >
      <div
        className=" flex"
        style={
          platform === "darwin"
            ? { marginLeft: "70px" }
            : { marginLeft: "10px" }
        }
      >
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
        {similarFilesOpen ? (
          <PiSidebarFill
            className="text-gray-100 cursor-pointer mt-[0.04rem]"
            size={28}
            onClick={toggleSimilarFiles}
            title="Hide Similar Files"
          />
        ) : (
          <PiSidebar
            className="text-gray-100 cursor-pointer mt-[0.04rem]"
            size={28}
            onClick={toggleSimilarFiles}
            title="Show Similar Files"
          />
        )}

        <div className="mt-[0.33rem] mr-[0.5rem] ml-[0.3rem]">
          {chatbotOpen ? (
            <BsFillChatLeftDotsFill
              size={22}
              className="text-gray-100 cursor-pointer"
              onClick={toggleChatbot}
              title="Open Chatbot"
            />
          ) : (
            <BsChatLeftDots
              className="text-gray-100 cursor-pointer "
              size={22}
              onClick={toggleChatbot}
              title="Close Chatbot"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
