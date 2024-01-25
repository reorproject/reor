// DirectoryPicker.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@material-tailwind/react";

interface DirectoryPickerProps {
  userHasCompleted?: (completed: boolean) => void;
  userTriedToSubmit?: boolean;
}

const DirectoryPicker: React.FC<DirectoryPickerProps> = ({
  userHasCompleted,
  userTriedToSubmit,
}) => {
  const [userDirectory, setUserDirectory] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const userDirectory = window.electronStore.getUserDirectory();
    if (userDirectory) {
      setUserDirectory(userDirectory);
      if (userHasCompleted) {
        userHasCompleted(true);
      }
      setErrorMsg("");
    } else {
      if (userHasCompleted) {
        userHasCompleted(false);
      }
      setErrorMsg("No directory selected");
    }
  }, []);

  const handleDirectorySelection = async () => {
    const paths = await window.files.openDirectoryDialog();
    if (paths && paths.length > 0) {
      const path = paths[0];
      console.log("calling set directory IN DIRECTORY PICKER: ", path);
      window.electronStore.setUserDirectory(path);
      if (userHasCompleted) {
        userHasCompleted(true);
      }
      setErrorMsg("");
      setUserDirectory(path);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-semibold mb-0 text-white">
        Welcome to the Reor Project.
      </h2>
      <p className="mt-5 text-gray-100">
        Reor is a self-organizing personal knowledge management app. Each note
        you write will be saved as a markdown file to a vault directory on your
        machine.
      </p>
      <p className="mt-2 text-gray-100"></p>
      <p className="mt-7 text-gray-100 mb-5">
        Please choose your vault directory below:
      </p>
      <Button
        className="bg-slate-700 border-none h-10 hover:bg-slate-900 cursor-pointer w-[140px] text-center pt-0 pb-0 pr-2 pl-2 mb-2"
        onClick={handleDirectorySelection}
        placeholder=""
      >
        Select Directory
      </Button>
      {userDirectory ? (
        <p className="mt-2 text-xs text-gray-100">
          Selected: <strong>{userDirectory}</strong>
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-100">
          <i>Markdown files already in this directory will be indexed.</i>
        </p>
      )}
      {errorMsg && userTriedToSubmit && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </>
  );
};

export default DirectoryPicker;
