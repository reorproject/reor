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
    <div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleDirectorySelection}
      >
        Select Directory
      </button>
      After you select a directory, files currently in the directory will be
      indexed. This may take a while and we currently haven't implemented a
      progress bar :)
    </div>
  );
};

export default DirectoryPicker;
