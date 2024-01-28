import React, { useEffect, useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import LLMSettings from "./LLMSettings";
import EmbeddingModelManager from "./EmbeddingSettings";

interface OldInitialSettingsProps {
  readyForIndexing: () => void;
}

const OldInitialSetupSettings: React.FC<OldInitialSettingsProps> = ({
  readyForIndexing,
}) => {
  const [openAIKey, setOpenAIKey] = useState("");
  const [userDirectory, setUserDirectory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const key = window.electronStore.getOpenAIAPIKey() || ""; // Fallback to empty string if undefined
    setOpenAIKey(key);
  }, []);

  const handleNext = () => {
    window.electronStore.setOpenAIAPIKey(openAIKey);
    if (userDirectory) {
      window.electronStore.setUserDirectory(userDirectory);
      readyForIndexing();
    } else {
      setErrorMsg("Please select a directory.");
    }
  };

  useEffect(() => {
    const directory = window.electronStore.getUserDirectory();
    if (directory) {
      setUserDirectory(directory);
    }
  }, []);

  const handleDirectorySelection = async () => {
    const paths = await window.files.openDirectoryDialog();
    if (!paths) {
      return;
    }
    const path = paths[0];
    if (path) {
      setUserDirectory(path);
      // window.electronStore.setUserDirectory(path);
      // onDirectorySelected(path);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => console.log("Not allowing a close for now")}
      hideCloseButton={true}
    >
      <div className="w-full mr-3">
        <div className="ml-2 mt-0 h-full  ">
          <h2 className="text-2xl font-semibold mb-0 text-white">
            Welcome to the Reor Project.
          </h2>
          <p className="mt-2 text-gray-100">
            Reor is a self-organising note-taking app. Each note will be saved
            as a markdown file to a &quot;vault&quot; directory on your machine.
          </p>
          <p className="mt-2 text-gray-100">
            Please choose your vault directory here:
          </p>
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

          <h4 className="font-semibold mb-2 text-white">Embedding Model</h4>
          <EmbeddingModelManager />
          <LLMSettings />
          <h4 className="font-semibold mb-2 text-white">
            Open AI Key (Optional)
          </h4>
          <input
            type="text"
            className="block w-full px-3 py-2 box-border border border-gray-300 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
            value={openAIKey}
            onChange={(e) => setOpenAIKey(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Open AI API Key"
          />

          <Button
            className="bg-slate-700 mt-6 mb-3  border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
            onClick={handleNext}
            placeholder=""
          >
            Next
          </Button>
          {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
        </div>
      </div>
    </Modal>
  );
};

export default OldInitialSetupSettings;
