// import React from "react";

interface Props {
  onDirectorySelected: (path: string) => void;
}

const DirectoryPicker: React.FC<Props> = ({ onDirectorySelected }) => {
  const handleDirectorySelection = async () => {
    const path = await window.files.openDirectoryDialog();
    if (path) {
      window.electronStore.setUserDirectory(path);
      onDirectorySelected(path);
    }
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={handleDirectorySelection}
    >
      Select Directory
    </button>
  );
};

export default DirectoryPicker;
