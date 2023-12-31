import { MdChatBubbleOutline, MdSearch } from "react-icons/md"; // Material Design search icon
import { HiOutlinePlusCircle } from "react-icons/hi"; // Heroicons plus circle
import { HiSearch } from "react-icons/hi"; // Outlined search icon
import { HiOutlineSearch } from "react-icons/hi"; // Solid search icon
import SearchComponent from "./Search/Search";
import NewNoteComponent from "./File/NewNote";
import { MdChatBubble } from "react-icons/md";
import { useState } from "react";
import { FaPenSquare } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { TbEqualDouble } from "react-icons/tb";
import { PiSidebar } from "react-icons/pi";
import { BsFillChatRightDotsFill } from "react-icons/bs";

import {
  BsChatRightDots,
  BsChatLeftDots,
  BsFillChatLeftDotsFill,
} from "react-icons/bs";

interface TitleBarProps {
  onFileSelect: (path: string) => void;
  chatbotOpen: boolean;
  toggleChatbot: () => void;
  toggleSimilarFiles: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  chatbotOpen,
  toggleChatbot,
  toggleSimilarFiles,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <div id="customTitleBar" className="h-[30px] bg-white flex justify-between">
      <div className="ml-[65px] flex">
        {/* <button className="bg-transparent border-none cursor-pointer">
        <MdSearch className="text-gray-600" size={24} />
      </button> */}
        <div className="ml-2">
          <SearchComponent onFileSelect={onFileSelect} />
        </div>
        <button
          className="bg-transparent border-none cursor-pointer ml-1"
          onClick={toggleModal}
        >
          <FaRegPenToSquare className="" size={20} />
        </button>

        <NewNoteComponent
          isOpen={isModalOpen}
          onClose={toggleModal}
          onFileSelect={onFileSelect}
        />
      </div>

      <div className="flex justify-content-right align-items-right">
        {/* <button
          className="bg-transparent border-none cursor-pointer mr-0 bg-blue-300"
          onClick={() => {
            toggleSimilarFiles();
            toggleChatbot();
          }}
        > */}
        <PiSidebar
          className="text-gray-600 cursor-pointer"
          size={28}
          onClick={toggleSimilarFiles}
        />
        {/* </button> */}
        {/* <button
          className="bg-transparent border-none cursor-pointer mt-[2.3px]  bg-yellow-300 padding-0"
          onClick={toggleChatbot}
        > */}
        <div className="mt-[0.32rem] mr-[0.5rem] ml-[0.3rem]">
          {chatbotOpen ? (
            <BsFillChatLeftDotsFill
              size={22}
              className="text-gray-600 cursor-pointer"
              onClick={toggleChatbot}
            />
          ) : (
            <BsChatLeftDots
              className="text-gray-600 cursor-pointer "
              size={22}
              onClick={toggleChatbot}
            />
          )}
        </div>
        {/* </button> */}
      </div>
    </div>
  );
};

export default TitleBar;
