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

const NewOllamaModelModal: React.FC<NewOllamaModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  // const [newModelPath, setNewModelPath] = useState<string>("");
  const [modelName, setModelName] = useState("");
  const [error, setError] = useState("");
  const [downloadProgress, setDownloadProgress] = useState<ProgressResponse>();

  const downloadSelectedModel = async () => {
    if (!modelName) {
      setError("Please enter a model name");
      return;
    }
    let taggedModelName = modelName;
    if (!taggedModelName.includes(":")) {
      taggedModelName = `${taggedModelName}:latest`;
    }
    try {
      setError("");
      await window.llm.pullOllamaModel(taggedModelName);
      await window.llm.setDefaultLLM(taggedModelName);
    } catch (e) {
      setError(errorToString(e));
    }
  };

  useEffect(() => {
    let active = true;
    const updateStream = (progress: ProgressResponse) => {
      if (!active) return;
      setDownloadProgress(progress);
    };

    window.ipcRenderer.receive("ollamaDownloadProgress", updateStream);

    return () => {
      active = false;
      window.ipcRenderer.removeListener("ollamaDownloadProgress", updateStream);
    };
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h2 className="text-white  font-semibold mb-0">New Local Model</h2>
        <p className="text-white text-sm mb-2 mt-1">
          To use paste the name of the model you want to use below. It will be
          downloaded automatically. You can find models on the{" "}
          <ExternalLink href="https://ollama.com/library" label="Ollama Hub" />.
        </p>

        <input
          type="text"
          className="block w-full mt-1 px-3 py-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="Ollama Model Name"
        />
        <p className="text-white text-xs mb-2 mt-2 italic">
          {" "}
          We recommended either mistral, llama2, or phi.
        </p>
        <Button
          className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-[100px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
          onClick={downloadSelectedModel}
          placeholder=""
        >
          Download
        </Button>
        {downloadProgress && !error && (
          <p className="text-white text-sm mt-2">
            {downloadProgress.status === "success" ? (
              "Download complete! Refrsh the chat window to use the new model."
            ) : (
              <>
                Download Progress:{" "}
                {downloadPercentage(downloadProgress).toFixed(2)}%.
                <p className="text-xs">(You can close this Window)</p>
              </>
            )}
          </p>
        )}
        {error && <p className="text-xs text-red-500 break-words">{error}</p>}
      </div>
    </Modal>
  );
};

export default NewOllamaModelModal;

const downloadPercentage = (progress: ProgressResponse): number => {
  if (progress.status === "success") {
    return 100;
  }

  // Check if `total` is 0, undefined, or not a number to avoid division by zero or invalid operations
  if (!progress.total || isNaN(progress.total) || progress.total === 0) {
    // Depending on your logic, you might want to return 0, or handle this case differently
    return 0;
  }

  // Similarly, ensure `completed` is a valid number
  const completed = isNaN(progress.completed) ? 0 : progress.completed;

  // Calculate the download percentage
  const percentage = (100 * completed) / progress.total;

  // Optional: clamp the value between 0 and 100 if needed
  return Math.max(0, Math.min(percentage, 100));
};
