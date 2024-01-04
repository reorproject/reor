// import React from "react";

import { useEffect, useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import AIModelManager from "./LLMSettings";

interface Props {
  onDirectorySelected: (path: string) => void;
}

const DirectoryPicker: React.FC<Props> = ({ onDirectorySelected }) => {
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
      onDirectorySelected(userDirectory);
    } else {
      setErrorMsg("Please select a directory.");
    }
  };

  const handleDirectorySelection = async () => {
    const path = await window.files.openDirectoryDialog();
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

  // useEffect(() => {
  //   const listener = async (progress: string) => {
  //     console.log(
  //       "received vector-database-update event: PROGRESS: ",
  //       progress
  //     );
  //     // const searchResults = await performSearch(filePath);
  //     // setSimilarEntries(searchResults);
  //   };

  //   window.ipcRenderer.receive("indexing-progress", listener);
  //   return () => {
  //     window.ipcRenderer.removeListener("indexing-progress", listener);
  //   };
  // }, []);

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
            At its heart, this is a markdown editor with embedded AI. Everything
            is written to a directory on your filesystem. Please choose that
            directory here:
          </p>
          <Button
            className="bg-slate-700 mt-2 border-none h-10 hover:bg-slate-900 cursor-pointer w-[140px] text-center pt-0 pb-0 pr-2 pl-2"
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
          <input
            type="text"
            className="block w-full box-border px-3 py-2 mr-2 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
            value={"BAAI/bge-base-en-v1.5"}
            disabled
            placeholder="Embedding Model Name"
          />
          <AIModelManager />
          {/* <h4 className="font-semibold mb-2 text-white">LLM</h4>
          <input
            type="text"
            className="block w-full px-3 py-2 box-border border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
            value={"GPT-3.5-turbo"}
            disabled
            placeholder="LLM Model Name"
          /> */}
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

export default DirectoryPicker;
