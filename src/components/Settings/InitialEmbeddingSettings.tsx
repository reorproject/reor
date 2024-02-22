import React, { useState, useEffect } from "react";
import CustomSelect from "../Generic/Select";
// import { modelRepos } from "./EmbeddingSettings";

export const modelRepos = [
  {
    label: "bge-base-en-v1.5 (medium, recommended)",
    value: "Xenova/bge-base-en-v1.5",
  },
  { label: "UAE-Large-V1 (large) ", value: "Xenova/UAE-Large-V1" },
  { label: "bge-small-en-v1.5 (small)", value: "Xenova/bge-small-en-v1.5" },
];
interface InitialEmbeddingModelSettingsProps {
  userHasCompleted?: (completed: boolean) => void;
  handleUserHasChangedModel?: (bool: boolean) => void;
  userTriedToSubmit?: boolean;
}
const InitialEmbeddingModelSettings: React.FC<
  InitialEmbeddingModelSettingsProps
> = ({ userHasCompleted, handleUserHasChangedModel, userTriedToSubmit }) => {
  const [currentError, setCurrentError] = useState<string>("");

  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    const defaultModel = window.electronStore.getDefaultEmbeddingModel();
    if (defaultModel) {
      setSelectedModel(defaultModel);
    } else {
      setSelectedModel(modelRepos[0].value);
      // window.electronStore.setDefaultEmbeddingModel(modelRepos[0].value);
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
    window.electronStore.setDefaultEmbeddingModel(newSelectedModel);
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel(true);
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded">
      <h3 className="font-semibold mb-2 text-white">Embedding Model</h3>{" "}
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

export default InitialEmbeddingModelSettings;
