import { useState, useEffect } from "react";

import { LLMConfig } from "electron/main/Store/storeConfig";

const useLLMConfigs = () => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([]);
  const [defaultLLM, setDefaultLLM] = useState<string>("");

  const fetchAndUpdateModelConfigs = async () => {
    try {
      const fetchedLLMConfigs = await window.llm.getLLMConfigs();
      setLLMConfigs(fetchedLLMConfigs);
      const defaultLLM = await window.llm.getDefaultLLMName();
      if (!defaultLLM && fetchedLLMConfigs.length > 0) {
        await window.llm.setDefaultLLM(fetchedLLMConfigs[0].modelName);
        setDefaultLLM(fetchedLLMConfigs[0].modelName);
      } else {
        setDefaultLLM(defaultLLM);
      }
    } catch (error) {
      console.error("Failed to fetch model configurations:", error);
    }
  };

  useEffect(() => {
    fetchAndUpdateModelConfigs();
  }, []);

  return { llmConfigs, defaultLLM, setDefaultLLM, fetchAndUpdateModelConfigs };
};

export default useLLMConfigs;
