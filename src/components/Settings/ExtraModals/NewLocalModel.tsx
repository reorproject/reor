import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../../Generic/Modal";
import ExternalLink from "../../Generic/ExternalLink";
import { LocalLLMConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../../Generic/Select";

interface LocalModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const contextLengthOptions = [
  { label: "1024", value: "1024" },
  { label: "2048 (recommended)", value: "2048" },
  { label: "4096", value: "4096" },
  { label: "8192", value: "8192" },
  { label: "16384", value: "16384" },
  { label: "32768", value: "32768" },
];

const LocalModelModal: React.FC<LocalModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedContextLength, setSelectedContextLength] = useState(
    contextLengthOptions[1].value
  );

  const [newModelPath, setNewModelPath] = useState<string>("");

  const handleModelFileSelection = async () => {
    const paths = await window.files.openFileDialog();
    if (paths && paths.length > 0) {
      setNewModelPath(paths[0]);
    }
  };
  const saveModelConfigToElectronStore = async () => {
    if (!newModelPath || !selectedContextLength) {
      onClose();
      return;
    }

    const newModelName = await window.path.basename(newModelPath);
    console.log("newModelName: ", newModelName);
    const newConfig: LocalLLMConfig = {
      type: "local",
      modelName: newModelName,
      localPath: newModelPath,
      contextLength: parseInt(selectedContextLength),
      engine: "llamacpp",
    };

    await window.llm.addOrUpdateLLM(newConfig);
    await window.llm.setDefaultLLM(newModelName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={saveModelConfigToElectronStore}>
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h2 className="text-white  font-semibold mb-0">New Local Model</h2>
        <p className="text-white text-sm mb-2 mt-1">
          To use a local model you need to download a GGUF model file and attach
          it here. More info is available in the{" "}
          <ExternalLink
            url="https://www.reorproject.org/docs/documentation/llm"
            label="docs"
          />
          .
        </p>

        <Button
          className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer w-[180px] text-center pt-0 pb-0 pr-2 pl-2 mt-1"
          onClick={handleModelFileSelection}
          placeholder=""
        >
          Select Model .GGUF File
        </Button>
        <p className="text-white text-xs mb-2 mt-2 italic">
          {" "}
          You can download the most popular models from{" "}
          <ExternalLink
            url="https://huggingface.co/models?sort=downloads&search=gguf"
            label="Huggingface"
          />
          .
        </p>
        {newModelPath && (
          <p className="mt-2 text-xs text-gray-100">
            Selected: <strong>{newModelPath}</strong>
          </p>
        )}
        <h3 className="text-gray-100 mb-2 mt-6">Context Length</h3>
        <CustomSelect
          options={contextLengthOptions}
          value={selectedContextLength}
          onChange={(newValue) => {
            setSelectedContextLength(newValue);
          }}
        />
        <p className="text-gray-100 text-xs mb-2 mt-2">
          <i>
            If you experience a crash, try lowering the context length. If you
            get a context length error, increase it. 2048 is recommended for all
            systems to start with.
          </i>
        </p>

        <Button
          className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
          onClick={saveModelConfigToElectronStore}
          placeholder=""
        >
          Save
        </Button>
      </div>
    </Modal>
  );
};

export default LocalModelModal;
