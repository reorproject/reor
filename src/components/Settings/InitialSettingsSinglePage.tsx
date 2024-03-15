import React, { useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import LLMSettings from "./LLMSettings";
import DirectorySelector from "./DirectorySelector";
import InitialEmbeddingModelSettings from "./InitialEmbeddingSettings";

interface OldInitialSettingsProps {
  readyForIndexing: () => void;
}

const InitialSetupSinglePage: React.FC<OldInitialSettingsProps> = ({
  readyForIndexing,
}) => {
  const [directoryErrorMsg, setDirectoryErrorMsg] = useState("");
  const [embeddingErrorMsg, setEmbeddingErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);

  const handleNext = () => {
    if (!directoryErrorMsg && !embeddingErrorMsg) {
      readyForIndexing();
    } else {
      setShowError(true);
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
          <DirectorySelector setErrorMsg={setDirectoryErrorMsg} />
          {showError && directoryErrorMsg && (
            <p className="text-xs text-red-500">{directoryErrorMsg}</p>
          )}
          <p className="mt-2 text-xs text-gray-100 ">
            Your vault directory doesn&apos;t need to be empty. Only markdown
            files will be indexed.
          </p>

          <div className="mt-8">
            <InitialEmbeddingModelSettings setErrorMsg={setEmbeddingErrorMsg} />
            {showError && embeddingErrorMsg && (
              <p className="text-xs text-red-500">{embeddingErrorMsg}</p>
            )}
          </div>
          <LLMSettings isInitialSetup={true} />
          <Button
            className="bg-neutral-700 mt-4 mb-3  border-none h-10 hover:bg-neutral-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
            onClick={handleNext}
            placeholder=""
          >
            Next
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default InitialSetupSinglePage;
