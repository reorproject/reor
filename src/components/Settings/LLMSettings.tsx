import React, { useState, useEffect, ChangeEvent } from "react";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";

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
    // const selectedModel = e.target.value;
    setDefaultModel(selectedModel);
    window.electronStore.setDefaultAIModel(selectedModel);
  };
  const modelNames = Object.keys(modelConfigs);

  return (
    <div className="w-full ">
      <h4 className="font-semibold mb-2 text-white">LLM</h4>

      <div className="w-full">
        <CustomSelect
          options={modelNames}
          value={defaultModel}
          onChange={handleDefaultModelChange}
        />
      </div>
      {/* <select
        value={defaultModel}
        onChange={handleDefaultModelChange}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-200 cursor-not-allowed"
      >
        {Object.entries(modelConfigs).map(([modelName, config]) => (
          <option key={modelName} value={modelName}>
            {modelName}
          </option>
        ))}
      </select> */}

      {/* <select value={defaultModel} onChange={handleDefaultModelChange}>
        {Object.entries(modelConfigs).map(([modelName, config]) => (
          <option key={modelName} value={modelName}>
            {modelName}
          </option>
        ))}
      </select> */}
      {/* <h2>Configure LLM</h2> */}
      <input
        type="text"
        placeholder="Model Name"
        name="modelName"
        value={currentModelName}
        onChange={(e) => setCurrentModelName(e.target.value)}
      />
      {/* Model Configuration Form */}
      <input
        type="text"
        placeholder="Local Path"
        name="localPath"
        value={currentConfig.localPath}
        onChange={handleInputChange}
      />
      <input
        type="number"
        placeholder="Context Length"
        name="contextLength"
        value={currentConfig.contextLength}
        onChange={handleInputChange}
      />
      <button onClick={saveModelConfig}>Save Configuration</button>

      {/* Default Model Dropdown */}
      {/* <h3>Default AI Model</h3> */}
    </div>
  );
};

export default AIModelManager;
