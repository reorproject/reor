import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../Generic/Modal";
import ExternalLink from "../Generic/ExternalLink";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";

interface LocalModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const contextLengthOptions = [
  { label: "1024", value: "1024" },
  { label: "2048 (recommended for most systems)", value: "2048" },
  { label: "4096", value: "4096" },
  { label: "8192", value: "8192" },
  { label: "16384", value: "16384" },
  { label: "32768", value: "32768" }, // This is slightly above 30k but included for completeness
];

const LocalModelModal: React.FC<LocalModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  // const [newModelContextLength, setNewModelContextLength] = useState<number>(
  //   parseInt(contextLengthOptions[1].value)
  // );

  const [selectedContextLength, setSelectedContextLength] = useState(
    contextLengthOptions[0].value
  );

  const [newModelPath, setNewModelPath] = useState<string>("");

  const handleModelFileSelection = async () => {
    const paths = await window.files.openFileDialog(["gguf"]);
    if (paths && paths.length > 0) {
      setNewModelPath(paths[0]);
    }
  };
  const saveModelConfigToElectronStore = async () => {
    if (!newModelPath || !selectedContextLength) {
      return;
    }
    const newConfig: AIModelConfig = {
      localPath: newModelPath,
      contextLength: parseInt(selectedContextLength),
      engine: "llamacpp",
    };

    const res = await window.electronStore.setupNewLocalLLM(newConfig);
    console.log("setupNewLocalLLM response: ", res);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[300px] ml-2 mr-2 mb-2">
        <h3 className="text-white  font-semibold mb-0">New Local Model</h3>
        <p className="text-white text-sm mb-2 mt-0">
          To use a local model you need to download a GGUF file onto your
          computer and attach it here. You can download the best models from{" "}
          <ExternalLink
            url="https://huggingface.co/TheBloke?sort_models=downloads#models"
            label="TheBloke on Huggingface"
          />
          .
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

        <CustomSelect
          options={contextLengthOptions}
          value={selectedContextLength}
          onChange={(newValue) => {
            setSelectedContextLength(newValue);
          }}
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
