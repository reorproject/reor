import React, { useState, useEffect, ChangeEvent } from "react";

interface AIModelConfig {
  localPath: string;
  contextLength: number;
  errorMsg?: string;
  engine: "openai" | "llamacpp";
}

interface ConfigureLLMComponentProps {
  // Props if needed
}

const ConfigureLLMComponent: React.FC<ConfigureLLMComponentProps> = ({}) => {
  const [modelConfigs, setModelConfigs] = useState<
    Record<string, AIModelConfig>
  >({});
  const [currentModelName, setCurrentModelName] = useState<string>("");
  const [currentConfig, setCurrentConfig] = useState<AIModelConfig>({
    localPath: "",
    contextLength: 0,
    engine: "openai",
  });

  useEffect(() => {
    // Function to fetch existing model configurations
    const fetchModelConfigs = async () => {
      try {
        const configs = await window.electronStore.getAIModelConfigs();
        setModelConfigs(configs);
      } catch (error) {
        console.error("Failed to fetch model configurations:", error);
      }
    };

    fetchModelConfigs();
  }, []);

  const handleModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentModelName(e.target.value);
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentConfig({
      ...currentConfig,
      [e.target.name]: e.target.value,
    });
  };

  const saveModelConfig = async () => {
    await window.electronStore.setupAIModel(currentModelName, currentConfig);
    // Optionally, refresh model configs after saving
  };
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentConfig({
      ...currentConfig,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentConfig({
      ...currentConfig,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      <h2>Configure LLM</h2>
      <input
        type="text"
        name="localPath"
        placeholder="Local Path"
        value={currentConfig.localPath}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="contextLength"
        placeholder="Context Length"
        value={currentConfig.contextLength}
        onChange={handleInputChange}
      />
      <select
        name="engine"
        value={currentConfig.engine}
        onChange={handleSelectChange}
      >
        <option value="openai">OpenAI</option>
        <option value="llamacpp">LlamaCPP</option>
      </select>
      <button onClick={saveModelConfig}>Save Configuration</button>
      {/* Optionally display existing model configurations */}
    </div>
  );
};

export default ConfigureLLMComponent;
