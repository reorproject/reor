import { MdChatBubbleOutline, MdSearch } from "react-icons/md"; // Material Design search icon
import { HiOutlinePlusCircle } from "react-icons/hi"; // Heroicons plus circle
import { HiSearch } from "react-icons/hi"; // Outlined search icon
import { HiOutlineSearch } from "react-icons/hi"; // Solid search icon
import SearchComponent from "./Search/Search";
import NewNoteComponent from "./File/NewNote";
import { MdChatBubble } from "react-icons/md";
import { useState } from "react";

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
        <div className="w-[120px] mr-2">
          <SearchComponent onFileSelect={onFileSelect} />
        </div>
        <button
          className="bg-transparent border-none cursor-pointer"
          onClick={toggleModal}
        >
          <HiOutlinePlusCircle className="text-gray-600" size={24} />
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
