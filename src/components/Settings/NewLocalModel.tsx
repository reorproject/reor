import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../Generic/Modal";
import ExternalLink from "../Generic/ExternalLink";
import { AIModelConfig } from "electron/main/Store/storeConfig";

interface LocalModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  //   newModelPath: string;
  //   setNewModelPath: (path: string) => void;
  //   newModelContextLength: number | null;
  //   setNewModelContextLength: (length: number) => void;
  //   saveModelConfig: () => Promise<void>;
}

const LocalModelModal: React.FC<LocalModelModalProps> = ({
  isOpen,
  onClose,
  //   newModelPath,
  //   setNewModelPath,
  //   newModelContextLength,
  //   setNewModelContextLength,
  //   saveModelConfig,
}) => {
  const [newModelContextLength, setNewModelContextLength] = useState<
    number | null
  >(null);
  const [newModelPath, setNewModelPath] = useState<string>("");
  const handleModelFileSelection = async () => {
    const paths = await window.files.openFileDialog(["gguf"]);
    if (paths && paths.length > 0) {
      setNewModelPath(paths[0]);
    }
  };
  const saveModelConfigToElectronStore = async () => {
    if (!newModelPath || !newModelContextLength) {
      return;
    }
    const newConfig: AIModelConfig = {
      localPath: newModelPath,
      contextLength: newModelContextLength,
      engine: "llamacpp",
    };

    const res = await window.electronStore.setupNewLocalLLM(newConfig);
    console.log("setupNewLocalLLM response: ", res);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[300px] ml-2 mr-2 mb-2">
        <p className="text-white text-lg font-semibold mb-0">
          Add New Local Model
        </p>
        <p className="text-white text-sm mb-2 mt-0">
          Choose a .gguf model file on your computer to use as a local model.
          You can download the best models from{" "}
          <ExternalLink
            url="https://huggingface.co/TheBloke?sort_models=downloads#models"
            label="TheBloke on Huggingface"
          />
        </p>

        <Button
          className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-[180px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
          onClick={handleModelFileSelection}
          placeholder=""
        >
          Select Model .GGUF File
        </Button>

        {newModelPath && (
          <p className="mt-2 text-xs text-gray-100">
            Selected: <strong>{newModelPath}</strong>
          </p>
        )}

        <input
          className="w-full p-2 mb-1 mt-3 text-black box-border"
          type="number"
          placeholder="Context Length (in tokens)"
          name="contextLength"
          value={newModelContextLength || ""}
          onChange={(e) => setNewModelContextLength(parseInt(e.target.value))}
        />

        <Button
          className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-3"
          onClick={saveModelConfigToElectronStore}
          placeholder=""
        >
          Save New Model
        </Button>
      </div>
    </Modal>
  );
};

export default LocalModelModal;
