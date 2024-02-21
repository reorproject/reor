import React, { useState, useEffect } from "react";
import CustomSelect from "../Generic/Select";

interface EmbeddingModelManagerProps {
  userHasCompleted?: (completed: boolean) => void;
  handleUserHasChangedModel?: (bool: boolean) => void;
  userTriedToSubmit?: boolean;
}
const EmbeddingModelSettings: React.FC<EmbeddingModelManagerProps> = ({
  userHasCompleted,
  handleUserHasChangedModel,
  userTriedToSubmit,
}) => {
  const [currentError, setCurrentError] = useState<string>("");
  const modelRepos = [
    {
      label: "bge-base-en-v1.5 (medium, recommended)",
      value: "Xenova/bge-base-en-v1.5",
    },
    { label: "UAE-Large-V1 (large) ", value: "Xenova/UAE-Large-V1" },
    { label: "bge-small-en-v1.5 (small)", value: "Xenova/bge-small-en-v1.5" },
  ];

  const [selectedModel, setSelectedModel] = useState<string>("");

  useEffect(() => {
    const defaultModel = window.electronStore.getDefaultEmbeddingModel();
    if (defaultModel) {
      setSelectedModel(defaultModel);
    } else {
      setSelectedModel(modelRepos[0].value);
      window.electronStore.setDefaultEmbeddingModel(modelRepos[0].value);
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
      <h2 className="text-2xl font-semibold mb-0 text-white">
        Embedding Model
      </h2>{" "}
      <p className="mt-5 text-gray-100">
        If you change this, your files will be re-indexed:
      </p>{" "}
      <CustomSelect
        options={modelRepos}
        value={selectedModel}
        onChange={handleChangeOnModelSelect}
      />
      <p className=" text-gray-100 text-xs">
        <i>
          If you notice some lag in the editor it is likely because you chose
          too large of a model...
        </i>
      </p>{" "}
      {userTriedToSubmit && !selectedModel && (
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
      )}
    </div>
  );
};

export default EmbeddingModelSettings;
