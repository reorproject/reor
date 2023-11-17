import { MdSearch } from "react-icons/md"; // Material Design search icon
import { HiOutlinePlusCircle } from "react-icons/hi"; // Heroicons plus circle
import { HiSearch } from "react-icons/hi"; // Outlined search icon
import { HiOutlineSearch } from "react-icons/hi"; // Solid search icon

const TitleBar: React.FC = () => {
  return (
    <div className="h-[30px] bg-white">
      <button className="-webkit-app-region-no-drag hover:bg-gray-200 p-1 rounded">
        <MdSearch className="text-gray-600" size={24} />
        <HiOutlineSearch className="text-gray-600" size={24} />
      </button>
      <HiSearch className="text-gray-600" size={24} />

      <button className="-webkit-app-region-no-drag hover:bg-gray-200 p-1 rounded">
        <HiOutlinePlusCircle className="text-gray-600" size={24} />
      </button>
    </div>
  );
};

export default TitleBar;
