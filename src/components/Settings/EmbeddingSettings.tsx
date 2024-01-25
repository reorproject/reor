import React, { useState, useEffect, ReactNode } from "react";
import CustomSelect from "../Generic/Select";

interface EmbeddingModelManagerProps {
  userHasCompleted?: (completed: boolean) => void;
  handleUserHasChangedModel?: (bool: boolean) => void;
  userTriedToSubmit?: boolean;
  children?: ReactNode; // Define children prop
}
const EmbeddingModelManager: React.FC<EmbeddingModelManagerProps> = ({
  userHasCompleted,
  handleUserHasChangedModel,
  userTriedToSubmit,
  children,
}) => {
  const [currentError, setCurrentError] = useState<string>("");
  const modelRepos = [
    "Xenova/bge-large-en-v1.5",
    "Xenova/bge-base-en-v1.5",
    "Xenova/UAE-Large-V1",
    "Xenova/all-MiniLM-L6-v2",
  ];

  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    const defaultModel = window.electronStore.getDefaultEmbedFuncRepo();
    if (defaultModel) {
      setSelectedModel(defaultModel);
    } else {
      setSelectedModel(modelRepos[0]);
      window.electronStore.setDefaultEmbedFuncRepo(modelRepos[0]);
      if (handleUserHasChangedModel) {
        handleUserHasChangedModel(true);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedModel) {
      if (setCurrentError) {
        setCurrentError("");
      }
      if (userHasCompleted) {
        userHasCompleted(true);
      }
    } else {
      if (setCurrentError) {
        setCurrentError("No model selected");
      }
      if (userHasCompleted) {
        userHasCompleted(false);
      }
    }
  }, [selectedModel]);

  const handleChangeOnModelSelect = (newSelectedModel: string) => {
    setSelectedModel(newSelectedModel);
    window.electronStore.setDefaultEmbedFuncRepo(newSelectedModel);
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel(true);
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded">
      {children}
      <CustomSelect
        options={modelRepos}
        value={selectedModel}
        onChange={handleChangeOnModelSelect}
      />
      {userTriedToSubmit && !selectedModel && (
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
      )}
    </div>
  );
};

export default EmbeddingModelManager;
