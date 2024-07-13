import React, { useEffect, useState } from "react";

import { Button } from "@material-tailwind/react";

interface DirectorySelectorProps {
  setErrorMsg: (error: string) => void;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  setErrorMsg,
}) => {
  const [userDirectory, setUserDirectory] = useState<string>("");

  const handleDirectorySelection = async () => {
    const paths = await window.fileSystem.openDirectoryDialog();
    if (paths.length > 0 && paths[0]) {
      setUserDirectory(paths[0]);
    }
  };

  useEffect(() => {
    const fetchDirectory = async () => {
      const directory = await window.electronStore.getVaultDirectoryForWindow();
      if (directory) {
        setUserDirectory(directory);
      }
    };
    fetchDirectory();
  }, []);

  useEffect(() => {
    if (!userDirectory) {
      setErrorMsg("Please select a directory");
    } else {
      window.electronStore.setVaultDirectoryForWindow(userDirectory);
      setErrorMsg("");
    }
  }, [userDirectory, setErrorMsg]);

  return (
    <div className="flex flex-col items-end">
      <Button
        className="bg-blue-500 border-none h-10 hover:bg-blue-600 cursor-pointer w-[140px] text-center pt-0 pb-0 pr-2 pl-2"
        onClick={handleDirectorySelection}
        placeholder={""}
      >
        Select Directory
      </Button>
      {userDirectory && (
        <p className="mt-2 text-xs text-gray-100 text-right w-full">
          Selected: <strong>{userDirectory}</strong>
        </p>
      )}
    </div>
  );
};

export default DirectorySelector;
