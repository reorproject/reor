import React, { useState, useEffect } from "react";
import CustomSelect from "../Generic/Select";

interface EmbeddingModelManagerProps {
  handleUserHasChangedModel?: (bool: boolean) => void;
}
const EmbeddingModelManager: React.FC<EmbeddingModelManagerProps> = ({
  handleUserHasChangedModel,
}) => {
  const modelRepos = [
    "Xenova/bge-large-en-v1.5",
    "Xenova/bge-base-en-v1.5",
    "Xenova/UAE-Large-V1",
    "Xenova/all-MiniLM-L6-v2",
  ];

  // State to keep track of the selected model
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

  const handleChangeOnModelSelect = (newSelectedModel: string) => {
    setSelectedModel(newSelectedModel);
    window.electronStore.setDefaultEmbedFuncRepo(newSelectedModel);
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel(true);
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded">
      <CustomSelect
        options={modelRepos}
        value={selectedModel}
        onChange={handleChangeOnModelSelect}
      />
    </div>
  );
};

export default EmbeddingModelManager;
