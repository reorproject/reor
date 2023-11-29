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

interface TitleBarProps {
  onFileSelect: (path: string) => void;
  chatbotOpen: boolean;
  toggleChatbot: () => void;
}

const TitleBar: React.FC<TitleBarProps> = ({
  onFileSelect,
  chatbotOpen,
  toggleChatbot,
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
      <div className="ml-auto">
        <button
          className="bg-transparent border-none cursor-pointer"
          onClick={toggleChatbot}
        >
          {chatbotOpen ? (
            <MdChatBubble className="text-gray-600" size={24} />
          ) : (
            <MdChatBubbleOutline className="text-gray-600" size={24} />
          )}
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
