import React, { useState, useEffect, ChangeEvent } from "react";
import { AIModelConfig } from "electron/main/Store/storeConfig";

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

  const handleDefaultModelChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedModel = e.target.value;
    setDefaultModel(selectedModel);
    window.electronStore.setDefaultAIModel(selectedModel);
  };

  return (
    <div>
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
      <select value={defaultModel} onChange={handleDefaultModelChange}>
        {Object.entries(modelConfigs).map(([modelName, config]) => (
          <option key={modelName} value={modelName}>
            {modelName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AIModelManager;
