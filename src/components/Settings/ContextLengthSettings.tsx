import React, { useState, useEffect } from "react";
import Modal from "../Generic/Modal";
import { AIModelConfig } from "electron/main/Store/storeConfig";
import CustomSelect from "../Generic/Select";

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
  // State to manage context lengths for all models
  const [contextLengths, setContextLengths] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    // Initialize contextLengths state when modelConfigs is updated
    const initialContextLengths = Object.keys(modelConfigs).reduce(
      (acc, key) => {
        acc[key] = modelConfigs[key].contextLength?.toString() || "";
        return acc;
      },
      {} as Record<string, string>
    );
    setContextLengths(initialContextLengths);
  }, [modelConfigs]);

  // Options for context length dropdown
  const contextLengthOptions = [
    { label: "512", value: "512" },
    { label: "1024", value: "1024" },
    { label: "2048", value: "2048" },
    // Add more options as needed
  ];

  // Handle changing context length for a specific model
  const handleContextLengthChange = (modelKey: string, value: string) => {
    setContextLengths((prev) => ({ ...prev, [modelKey]: value }));
    // Update modelConfigs state here if needed
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {Object.keys(modelConfigs).map((modelKey) => (
        <div key={modelKey}>
          <h3>Model: {modelKey}</h3>
          <CustomSelect
            options={contextLengthOptions}
            value={contextLengths[modelKey] || ""}
            onChange={(value: string) =>
              handleContextLengthChange(modelKey, value)
            }
          />
        </div>
      ))}
    </Modal>
  );
};

export default ContextLengthModal;
