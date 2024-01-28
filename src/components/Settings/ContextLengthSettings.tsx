import React, { useState, useEffect } from "react";
import Modal from "../Generic/Modal";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";
import { contextLengthOptions } from "./NewLocalModel";

interface ContextLengthModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelConfigs: Record<string, AIModelConfig>;
}

const ContextLengthModal: React.FC<ContextLengthModalProps> = ({
  isOpen,
  onClose,
  modelConfigs,
}) => {
  const [localModelConfigs, setLocalModelConfigs] = useState<
    Record<string, AIModelConfig>
  >({});

  useEffect(() => {
    // Initialize localModelConfigs state when modelConfigs is updated
    setLocalModelConfigs({ ...modelConfigs });
  }, [modelConfigs]);

  // Options for context length dropdown

  const updateAIModelConfig = async (
    modelName: string,
    modelConfig: AIModelConfig
  ) => {
    try {
      await window.electronStore.updateAIModelConfig(modelName, modelConfig);
      console.log(`Model config updated for ${modelName}`);
    } catch (error) {
      console.error(`Error updating model config for ${modelName}:`, error);
    }
  };
  // Handle changing context length for a specific model
  const handleContextLengthChange = (modelKey: string, value: string) => {
    const newContextLength = parseInt(value);
    setLocalModelConfigs((prevConfigs) => ({
      ...prevConfigs,
      [modelKey]: {
        ...prevConfigs[modelKey],
        contextLength: newContextLength,
      },
    }));

    // Call updateAIModelConfig with the updated model config
    updateAIModelConfig(modelKey, {
      ...localModelConfigs[modelKey],
      contextLength: newContextLength,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {Object.entries(localModelConfigs)
        .filter(([_, config]) => config.engine === "llamacpp")
        .map(([modelKey, config]) => (
          <div key={modelKey}>
            <h3>Model: {modelKey}</h3>
            <CustomSelect
              options={contextLengthOptions}
              value={config.contextLength?.toString() || ""}
              onChange={(value) => handleContextLengthChange(modelKey, value)}
            />
          </div>
        ))}
    </Modal>
  );
};

export default ContextLengthModal;
