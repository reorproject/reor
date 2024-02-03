import React, { useState } from "react";
import { Button } from "@material-tailwind/react";

interface DirectorySelectorProps {
  onDirectorySelected: (directory: string) => void;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  onDirectorySelected,
}) => {
  const [userDirectory, setUserDirectory] = useState<string>("");

  const handleDirectorySelection = async () => {
    const paths = await window.files.openDirectoryDialog();
    if (paths && paths[0]) {
      setUserDirectory(paths[0]);
      onDirectorySelected(paths[0]);
    }
  };

  return (
    <div>
      <Button
        className="bg-slate-700  border-none h-10 hover:bg-slate-900 cursor-pointer w-[140px] text-center pt-0 pb-0 pr-2 pl-2"
        onClick={handleDirectorySelection}
        placeholder=""
      >
        Select Directory
      </Button>
      {userDirectory && (
        <p className="mt-2 text-xs text-gray-100">
          Selected: <strong>{userDirectory}</strong>
        </p>
      )}
    </div>
  );
};

export default DirectorySelector;
