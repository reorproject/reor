import React, { useEffect, useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import LLMSettings from "./LLMSettings";
import EmbeddingModelManager from "./EmbeddingSettings";
import DirectorySelector from "./DirectorySelectorNew";

interface OldInitialSettingsProps {
  readyForIndexing: () => void;
}

const InitialSetupSinglePage: React.FC<OldInitialSettingsProps> = ({
  readyForIndexing,
}) => {
  const [userDirectory, setUserDirectory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleNext = () => {
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

  return (
    <Modal
      isOpen={true}
      onClose={() => console.log("Not allowing a close for now")}
      hideCloseButton={true}
    >
      <div className="w-full mr-4 ml-2">
        <div className="ml-2 mt-0 h-full  ">
          <h2 className="text-2xl font-semibold mb-0 text-white">
            Welcome to the Reor Project.
          </h2>
          <p className="mt-2 text-gray-100 ">
            Reor is a self-organising note-taking app. Each note will be saved
            as a markdown file to a &quot;vault&quot; directory on your machine.
          </p>
          <p className="mt-2 text-gray-100">
            Choose your vault directory here:
          </p>
          <DirectorySelector onDirectorySelected={setUserDirectory} />
          <p className="mt-2 text-xs text-gray-100 ">
            (Your vault directory doesn&apos;t need to be empty)
          </p>

          <div className="mt-8">
            <EmbeddingModelManager>
              <h3 className="font-semibold mb-2 text-white">Embedding Model</h3>
            </EmbeddingModelManager>
          </div>
          <LLMSettings isInitialSetup={true} />
          <p className="mt-0 text-gray-100 text-xs">
            (You can customize your models later)
          </p>
          <Button
            className="bg-slate-700 mt-4 mb-3  border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
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

export default InitialSetupSinglePage;
