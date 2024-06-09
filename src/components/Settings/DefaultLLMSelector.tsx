
import React, { useState, useEffect } from "react";

import { LLMConfig } from "electron/main/Store/storeConfig";
import posthog from "posthog-js";

import CustomSelect from "../Generic/Select";

interface DefaultLLMSelectorProps {
  onModelChange: (model: string) => void;
  onModelError: (error: string) => void;
}

const DefaultLLMSelector: React.FC<DefaultLLMSelectorProps> = ({
  onModelChange,
  onModelError,
}) => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([]);
  const [defaultModel, setDefaultModel] = useState("");

  useEffect(() => {
    const fetchAndUpdateModelConfigs = async () => {
      try {
        const fetchedLLMConfigs = await window.llm.getLLMConfigs();
        setLLMConfigs(fetchedLLMConfigs);
        const defaultModelName = await window.llm.getDefaultLLMName();
        setDefaultModel(defaultModelName);
        onModelChange(defaultModelName);
      } catch (error) {
        console.error("Failed to fetch model configurations:", error);
        onModelError("Failed to fetch model configurations");
      }
    };

    fetchAndUpdateModelConfigs();
  }, []);

  const handleDefaultModelChange = (selectedModel: string) => {
    setDefaultModel(selectedModel);
    window.llm.setDefaultLLM(selectedModel);
    onModelChange(selectedModel);
    posthog.capture("change_default_llm", {
      defaultLLM: selectedModel,
    });
  };

  const modelOptions = llmConfigs.map((config) => ({
    label: config.modelName,
    value: config.modelName,
  }));

  return (
    <CustomSelect
      options={modelOptions}
      selectedValue={defaultModel}
      onChange={handleDefaultModelChange}
    />
  );
};

export default DefaultLLMSelector;
