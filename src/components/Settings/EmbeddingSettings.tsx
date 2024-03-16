import React, { useState, useEffect } from "react";
import CustomSelect from "../Generic/Select";
import { Button } from "@material-tailwind/react";
import NewLocalEmbeddingModelModal from "./ExtraModals/NewLocalEmbeddingModel";
import { EmbeddingModelConfig } from "electron/main/Store/storeConfig";
import NewRemoteEmbeddingModelModal from "./ExtraModals/NewRemoteEmbeddingModel";

interface EmbeddingModelManagerProps {
  // userHasCompleted?: (completed: boolean) => void;
  handleUserHasChangedModel?: () => void;
  userTriedToSubmit?: boolean;
}
const EmbeddingModelSettings: React.FC<EmbeddingModelManagerProps> = ({
  // userHasCompleted,
  handleUserHasChangedModel,
  userTriedToSubmit,
}) => {
  const [currentError, setCurrentError] = useState<string>("");
  const [
    isNewLocalEmbeddingModelModalOpen,
    setIsNewLocalEmbeddingModelModalOpen,
  ] = useState<boolean>(false);
  const [isConextLengthModalOpen, setIsContextLengthModalOpen] =
    useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [embeddingModels, setEmbeddingModels] = useState<
    Record<string, EmbeddingModelConfig>
  >({});

  const updateEmbeddingModels = () => {
    console.log("updating embedding models");
    const embeddingModels = window.electronStore.getEmbeddingModels();
    console.log("embedding models", embeddingModels);
    if (embeddingModels) {
      setEmbeddingModels(embeddingModels);
    }
    console.log("getting default model");
    const defaultModel = window.electronStore.getDefaultEmbeddingModel();
    console.log("default model", defaultModel);
    if (defaultModel) {
      setSelectedModel(defaultModel);
    }
  };

  useEffect(() => {
    updateEmbeddingModels();
  }, []);

  // TODO: perhaps this can be removed as well...
  useEffect(() => {
    if (selectedModel) {
      if (setCurrentError) {
        setCurrentError("");
      }
    } else {
      if (setCurrentError) {
        setCurrentError("No model selected");
      }
    }
  }, [selectedModel]);

  const handleChangeOnModelSelect = (newSelectedModel: string) => {
    setSelectedModel(newSelectedModel);
    window.electronStore.setDefaultEmbeddingModel(newSelectedModel);
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel();
    }
  };

  return (
    <div className="w-full bg-neutral-800 rounded">
      <h2 className="text-2xl font-semibold mb-0 text-white">
        Embedding Model
      </h2>{" "}
      <p className="mt-5 text-gray-100">
        If you change this, your files will be re-indexed:
      </p>{" "}
      {Object.keys(embeddingModels).length > 0 && (
        <CustomSelect
          options={Object.keys(embeddingModels).map((model) => {
            return { label: model, value: model };
          })}
          value={selectedModel}
          onChange={handleChangeOnModelSelect}
        />
      )}
      <p className=" text-gray-100 text-xs">
        <i>
          If you notice some lag in the editor it is likely because you chose
          too large of a model...
        </i>
      </p>{" "}
      <div className="flex">
        <Button
          className="bg-orange-700  border-none h-8 hover:bg-orange-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-2 mb-3 mr-4"
          onClick={() => setIsNewLocalEmbeddingModelModalOpen(true)}
          placeholder={""}
        >
          Attach Local Model
        </Button>
        <Button
          className="bg-orange-700  border-none h-8 hover:bg-orange-900 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-2 mb-3 mr-4"
          onClick={() => setIsContextLengthModalOpen(true)}
          placeholder={""}
        >
          Attach Remote Model
        </Button>
      </div>
      <NewLocalEmbeddingModelModal
        isOpen={isNewLocalEmbeddingModelModalOpen}
        onClose={() => {
          setIsNewLocalEmbeddingModelModalOpen(false);
        }}
        handleUserHasChangedModel={() => {
          updateEmbeddingModels();
          if (handleUserHasChangedModel) {
            handleUserHasChangedModel();
          }
        }}
      />
      <NewRemoteEmbeddingModelModal
        isOpen={isConextLengthModalOpen}
        onClose={() => {
          setIsContextLengthModalOpen(false);
        }}
        handleUserHasChangedModel={() => {
          updateEmbeddingModels();
          if (handleUserHasChangedModel) {
            handleUserHasChangedModel();
          }
        }}
      />
      {userTriedToSubmit && !selectedModel && (
        <p className="text-red-500 text-sm mt-1">{currentError}</p>
      )}
    </div>
  );
};

export default EmbeddingModelSettings;
