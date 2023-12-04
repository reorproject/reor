import { AIModelConfig } from "electron/main/Config/storeConfig";
import React, { useState, useEffect } from "react";

const AIModelDropdown: React.FC = () => {
  const [aiModels, setAIModels] = useState<Record<string, AIModelConfig>>({});
  const [defaultModel, setDefaultModel] = useState<string>("");

  useEffect(() => {
    // Fetch AI models and set them in state
    window.electronStore.getAIModelConfigs().then((configs) => {
      setAIModels(configs);
    });

    // Fetch the default model and set it in state
    window.electronStore.getDefaultAIModel().then((modelName) => {
      setDefaultModel(modelName);
    });
  }, []);

  const handleDefaultModelChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedModel = e.target.value;
    setDefaultModel(selectedModel);

    // Update the default model in the Electron store
    window.electronStore.setDefaultAIModel(selectedModel);
  };

  return (
    <div>
      <label htmlFor="aiModelSelect">Choose AI Model:</label>
      <select
        id="aiModelSelect"
        value={defaultModel}
        onChange={handleDefaultModelChange}
      >
        {Object.entries(aiModels).map(([modelName, config]) => (
          <option key={modelName} value={modelName}>
            {modelName}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AIModelDropdown;
