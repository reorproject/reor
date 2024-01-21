import React, { useState, useEffect } from "react";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";
import { Button } from "@material-tailwind/react";
import Modal from "../Generic/Modal";
import ExternalLink from "../Generic/ExternalLink";

const LLMSettings: React.FC = () => {
  const [modelConfigs, setModelConfigs] = useState<
    Record<string, AIModelConfig>
  >({});
  const [isNewLocalModelModalOpen, setIsNewLocalModelModalOpen] =
    useState<boolean>(false);
  const [newModelPath, setNewModelPath] = useState<string>("");
  const [newModelContextLength, setNewModelContextLength] = useState<
    number | null
  >(null);
  const [defaultModel, setDefaultModel] = useState<string>("");

  const fetchModelConfigs = async () => {
    try {
      const configs = await window.electronStore.getAIModelConfigs();
      setModelConfigs(configs);
      const defaultModelName = await window.electronStore.getDefaultAIModel();
      setDefaultModel(defaultModelName);
    } catch (error) {
      console.error("Failed to fetch model configurations:", error);
    }
  };

  useEffect(() => {
    fetchModelConfigs();
  }, []);

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
    // Refresh model configs after saving
    fetchModelConfigs();
    setIsNewLocalModelModalOpen(false);
  };

  const handleDefaultModelChange = (selectedModel: string) => {
    setDefaultModel(selectedModel);
    window.electronStore.setDefaultAIModel(selectedModel);
  };

  const modelNames = Object.keys(modelConfigs);

  const handleModelFileSelection = async () => {
    const paths = await window.files.openFileDialog(["gguf"]);
    if (!paths) {
      return;
    }
    const path = paths[0];
    if (path) {
      setNewModelPath(path);
    }
  };

  return (
    <div className="w-full  bg-gray-800 rounded">
      <h4 className="font-semibold mb-4 text-white">LLM</h4>

      <div className="w-full mb-1">
        <CustomSelect
          options={modelNames}
          value={defaultModel}
          onChange={handleDefaultModelChange}
          addButton={{
            label: "Add a New Local Model",
            onClick: () => setIsNewLocalModelModalOpen(true),
          }}
        />
      </div>

      <Modal
        isOpen={isNewLocalModelModalOpen}
        onClose={() => setIsNewLocalModelModalOpen(false)}
      >
        <div className="w-[300px] ml-2 mr-2 mb-2">
          <p className="text-white text-lg font-semibold mb-0">
            Add New Local Model
          </p>
          <p className="text-white text-sm mb-2 mt-0">
            Choose a .gguf model file on your computer to use as a local model.
            You can download the best models from{" "}
            {/* <div className="text-blue-300"> */}
            <ExternalLink
              url="https://huggingface.co/TheBloke?sort_models=downloads#models"
              label="TheBloke on Huggingface"
            />
          </p>

          <Button
            className="bg-slate-700  border-none h-8 hover:bg-slate-900 cursor-pointer w-[180px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
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
            className="bg-slate-700  border-none h-5 hover:bg-slate-900 cursor-pointer mt-2 text-center pt-0 pb-0 pr-2 pl-2"
            onClick={saveModelConfigToElectronStore}
            placeholder=""
          >
            Save New Model
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LLMSettings;
