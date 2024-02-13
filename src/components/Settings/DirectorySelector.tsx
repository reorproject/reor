import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";

interface DirectorySelectorProps {
  // windowVaultDirectory: string;
  setVaultDirectory: (directory: string) => void;
  setErrorMsg: (error: string) => void;
}

const DirectorySelector: React.FC<DirectorySelectorProps> = ({
  // windowVaultDirectory,
  setVaultDirectory,
  setErrorMsg,
}) => {
  const [userDirectory, setUserDirectory] = useState<string>("");

  const handleDirectorySelection = async () => {
    const paths = await window.files.openDirectoryDialog();
    if (paths && paths[0]) {
      setUserDirectory(paths[0]);
    }
  };

  useEffect(() => {
    if (!userDirectory) {
      setErrorMsg("Please select a directory");
    } else {
      // window.electronStore.setNewVaultDirectory(userDirectory);
      setVaultDirectory(userDirectory);
      setErrorMsg("");
    }
  }, [userDirectory]);

  // so this'll now depend on whether we are in like the initial setup or the settings page. Becuase on initial setup, we don't want to
  // create a new window, we just want to set the directory in parent
  // in actual settings we send the request to create a new window
  // Although we do want to set the state in the main process so that we can update our record of which windows are open right now.
  // ok but even in settings we haven't implemented anything.
  // so let's just implement the two separately for now then we'll try joining em.

  // so this is directory selector in initial settings, we just call the backend
  // but we also will need to bubble up the directory that has been selected
  // ah ok nah, so we shoot it to the backend, without a createWindow request
  // and then the backend will handle sending it to App.tsx.

  // so we could just have two routes for each:

  // 1. set directory for current window
  // 2. open new window with directory.

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
