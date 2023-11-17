import { MdSearch } from "react-icons/md"; // Material Design search icon
import { HiOutlinePlusCircle } from "react-icons/hi"; // Heroicons plus circle
import { HiSearch } from "react-icons/hi"; // Outlined search icon
import { HiOutlineSearch } from "react-icons/hi"; // Solid search icon

const TitleBar: React.FC = () => {
  return (
    <div className="h-[30px] bg-white flex justify-between space-x-2 pr-2 -webkit-app-region-drag">
      {/* <div className=""></div> */}
      <div className="ml-[90px] flex space-x-2">
        {/* <button className="-webkit-app-region-no-drag hover:bg-gray-200 p-1"> */}
        {/* <button className="-webkit-app-region-no-drag hover:bg-gray-200 p-1 "> */}
        <MdSearch className="text-gray-600 cursor-pointer" size={24} />
        {/* </button> */}
        {/* <button className="-webkit-app-region-no-drag hover:bg-gray-200 p-1"> */}
        <HiOutlinePlusCircle
          className="text-gray-600 cursor-pointer"
          size={24}
        />
        {/* </button> */}
      </div>
    </div>
  );
};

export default TitleBar;
