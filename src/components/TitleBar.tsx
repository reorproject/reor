import { MdSearch } from "react-icons/md"; // Material Design search icon
import { HiOutlinePlusCircle } from "react-icons/hi"; // Heroicons plus circle
import { HiSearch } from "react-icons/hi"; // Outlined search icon
import { HiOutlineSearch } from "react-icons/hi"; // Solid search icon
import SearchComponent from "./Search/Search";

const TitleBar: React.FC = () => {
  return (
    <div
      id="customTitleBar"
      className="h-[60px] bg-white flex justify-between space-x-2 pr-2"
    >
      <div className="ml-[90px] flex space-x-2">
        <button className="bg-transparent border-none cursor-pointer">
          <MdSearch className="text-gray-600" size={24} />
        </button>
        <SearchComponent />
        <button className="bg-transparent border-none cursor-pointer">
          <HiOutlinePlusCircle className="text-gray-600" size={24} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
