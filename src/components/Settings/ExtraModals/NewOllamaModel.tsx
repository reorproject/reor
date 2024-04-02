import React, { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../../Generic/Modal";
import ExternalLink from "../../Generic/ExternalLink";
import { errorToString } from "@/functions/error";
import { ProgressResponse } from "ollama";

interface NewOllamaModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModelDownloadStatus {
  progress: ProgressResponse;
  error?: string; // Optional error message
}

const NewOllamaModelModal: React.FC<NewOllamaModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  // const [newModelPath, setNewModelPath] = useState<string>("");
  const [modelName, setModelName] = useState("");
  const [modelNameerror, setModelNameError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState<{
    [modelName: string]: ModelDownloadStatus;
  }>({});

  const downloadSelectedModel = async () => {
    if (!modelName) {
      setModelNameError("Please enter a model name");
      return;
    }
    let taggedModelName = modelName;
    if (!taggedModelName.includes(":")) {
      taggedModelName = `${taggedModelName}:latest`;
    }
    try {
      await window.llm.pullOllamaModel(taggedModelName);
      await window.llm.setDefaultLLM(taggedModelName);
    } catch (e) {
      setDownloadProgress((prevProgress) => ({
        ...prevProgress,
        [taggedModelName]: {
          ...prevProgress[taggedModelName],
          error: errorToString(e),
        },
      }));
    }
  };

  useEffect(() => {
    const updateStream = (modelName: string, progress: ProgressResponse) => {
      setDownloadProgress((prevProgress) => ({
        ...prevProgress,
        [modelName]: {
          ...prevProgress[modelName],
          progress,
        },
      }));
    };

    const removeOllamaDownloadProgressListener = window.ipcRenderer.receive(
      "ollamaDownloadProgress",
      updateStream
    );

    return () => {
      removeOllamaDownloadProgressListener();
    };
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h2 className="text-white  font-semibold mb-0">New Local LLM</h2>
        <p className="text-white text-sm mb-2 mt-1">
          Reor will automaticaly download an LLM. Please choose an LLM from the{" "}
          <ExternalLink href="https://ollama.com/library">
            Ollama Library
          </ExternalLink>{" "}
          and paste the name of the LLM below:
        </p>

        <input
          type="text"
          className="block w-full mt-1 px-3 py-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="mistral"
        />
        <p className="text-white text-xs mb-2 mt-2 italic">
          {" "}
          We recommended either mistral, llama2, or command-r.
        </p>

        <Button
          className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-[100px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
          onClick={downloadSelectedModel}
          placeholder=""
        >
          Download
        </Button>
        {modelNameerror && (
          <p className="text-xs text-red-500 break-words">{modelNameerror}</p>
        )}
        <div>
          {Object.entries(downloadProgress).map(
            ([modelName, { progress, error }]) => (
              <div key={modelName} className="mb-4">
                {!error && progress.status === "success" ? (
                  <p className="text-white text-sm">
                    {`${modelName}: Download complete! Refresh the chat window to use the new model.`}
                  </p>
                ) : !error ? (
                  <>
                    <p className="text-white text-sm">
                      {`${modelName}: Download progress - ${downloadPercentage(
                        progress
                      )}`}
                    </p>
                  </>
                ) : (
                  <p className="text-red-500 text-sm break-words">
                    {`${modelName}: Error - ${error}`}
                  </p>
                )}
              </div>
            )
          )}
          {Object.entries(downloadProgress).length > 0 && (
            <p className="text-white text-xs">
              (Feel free to close this modal while the download completes.)
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NewOllamaModelModal;

const downloadPercentage = (progress: ProgressResponse): string => {
  // Check if `total` is 0, undefined, or not a number to avoid division by zero or invalid operations
  if (
    !progress.total ||
    isNaN(progress.total) ||
    progress.total === 0 ||
    !progress.completed ||
    isNaN(progress.completed)
  ) {
    // Depending on your logic, you might want to return 0, or handle this case differently
    return "checking...";
  }

  const percentage = (100 * progress.completed) / progress.total;

  return percentage.toFixed(2) + "%";
};
