import React, { useState, useEffect, ChangeEvent } from "react";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";
import { Button } from "@material-tailwind/react";

const AIModelManager: React.FC = () => {
  const [modelConfigs, setModelConfigs] = useState<
    Record<string, AIModelConfig>
  >({});
  const [currentModelName, setCurrentModelName] = useState<string>("");
  const [currentConfig, setCurrentConfig] = useState<AIModelConfig>({
    localPath: "",
    contextLength: 0,
    engine: "llamacpp",
  });
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [addingNewModel, setAddingNewModel] = useState<boolean>(false);

  // Function to fetch existing model configurations
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

  const saveModelConfig = async () => {
    console.log(
      "saving the following config: ",
      currentModelName,
      currentConfig
    );
    const res = await window.electronStore.setupNewLocalLLM(
      currentModelName,
      currentConfig
    );
    console.log("setupNewLocalLLM response: ", res);
    // Refresh model configs after saving
    fetchModelConfigs();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentConfig({
      ...currentConfig,
      [e.target.name]: e.target.value,
    });
  };

  const handleDefaultModelChange = (selectedModel: string) => {
    setDefaultModel(selectedModel);
    window.electronStore.setDefaultAIModel(selectedModel);
  };

  const toggleAddingNewModel = () => setAddingNewModel(!addingNewModel);

  const modelNames = Object.keys(modelConfigs);

  return (
    <div className="w-full  bg-gray-800 rounded">
      <h4 className="font-semibold mb-4 text-white">LLM</h4>

      <div className="w-full mb-1">
        <CustomSelect
          options={modelNames}
          value={defaultModel}
          onChange={handleDefaultModelChange}
        />
      </div>

      <Button
        className="bg-slate-700 border-none h-5 mt-1 hover:bg-slate-900 cursor-pointer  text-center pt-0 pb-0 pr-2 pl-2"
        onClick={toggleAddingNewModel}
        placeholder=""
      >
        {addingNewModel ? (
          <>
            <span>Cancel</span>
            <span className="ml-2">▲</span>
          </>
        ) : (
          <>
            <span>New Local Model</span>
            <span className="ml-2">▼</span>
          </>
        )}
      </Button>

      {addingNewModel && (
        <div className="mt-2">
          <input
            className="w-full p-2 mb-2 text-black box-border"
            type="text"
            placeholder="Model Name"
            name="modelName"
            value={currentModelName}
            onChange={(e) => setCurrentModelName(e.target.value)}
          />
          <input
            className="w-full p-2 mb-2 text-black box-border"
            type="text"
            placeholder="Local Path"
            name="localPath"
            value={currentConfig.localPath}
            onChange={handleInputChange}
          />
          <input
            className="w-full p-2 mb-2 text-black box-border"
            type="number"
            placeholder="Context Length (in tokens)"
            name="contextLength"
            value={currentConfig.contextLength || ""}
            onChange={handleInputChange}
          />
          <Button
            className="bg-slate-700  border-none h-5 hover:bg-slate-900 cursor-pointer  text-center pt-0 pb-0 pr-2 pl-2"
            onClick={saveModelConfig}
            placeholder=""
          >
            Save Configuration
          </Button>
        </div>
      )}
    </div>
  );
};

export default AIModelManager;
