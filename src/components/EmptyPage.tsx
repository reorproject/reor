import React from "react";
import { ImFileEmpty } from "react-icons/im";
// import { ipcRenderer } from "electron";

const EmptyPage = ({ vaultDirectory }) => {
  const handleCreateFile = () => {
    window.electronUtils.showCreateFileModal(vaultDirectory);
    console.log("Attemtping to create new file!");
  };

  const handleCreateFolder = () => {
    window.electronUtils.showCreateDirectoryModal(vaultDirectory);
  };

  console.log("Empty page vault dir:", vaultDirectory);

  return (
    <div className="absolute flex flex-col justify-center items-center w-full h-full overflow-hidden pb-40 text-white">
      <div className="opacity-10">
        <ImFileEmpty size={168} />
      </div>
      <h3 className="opacity-90 mb-0">No File Selected!</h3>
      <p className="opacity-70 mt-1">Open a file to begin using Reor!</p>
      <ul className="m-0 p-0 max-w-md space-y-1 text-blue-500 list-none dark:text-gray-300 cursor-pointer">
        <li className="pb-1" onClick={handleCreateFile}>
          Create a File
        </li>
        <li onClick={handleCreateFolder}>Create a Folder</li>
      </ul>
    </div>
  );
};

export default EmptyPage;
