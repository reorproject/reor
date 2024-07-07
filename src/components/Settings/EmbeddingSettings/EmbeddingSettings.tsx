import React, { useState, useEffect } from "react";

import { Button } from "@material-tailwind/react";
import { EmbeddingModelConfig } from "electron/main/electron-store/storeConfig";
import posthog from "posthog-js";

import CustomSelect from "../../Common/Select";
import ChunkSizeSettings from "../ChunkSizeSettings";

import NewLocalEmbeddingModelModal from "./modals/NewLocalEmbeddingModel";
import NewRemoteEmbeddingModelModal from "./modals/NewRemoteEmbeddingModel";

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

  const updateEmbeddingModels = async () => {
    console.log("updating embedding models");
    const embeddingModels = await window.electronStore.getEmbeddingModels();
    console.log("embedding models", embeddingModels);
    if (embeddingModels) {
      setEmbeddingModels(embeddingModels);
    }
    console.log("getting default model");
    const defaultModel = await window.electronStore.getDefaultEmbeddingModel();
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
    posthog.capture("change_default_embedding_model", {
      defaultEmbeddingModel: newSelectedModel,
    });
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel();
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-dark-gray-c-three rounded">
      <div>
        <h2 className="text-2xl font-semibold mb-0 text-white">
          Embedding Model
        </h2>{" "}
        <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2 mt-2">
          <div className="flex-col">
            <p className="mt-5 text-gray-100">
              Select Model
              <p className="text-gray-100 text-xs">
                If you change this your files will be re-indexed
              </p>
            </p>{" "}
          </div>
          <div className="flex items-end">
            {Object.keys(embeddingModels).length > 0 && (
              <CustomSelect
                options={Object.keys(embeddingModels).map((model) => {
                  return { label: model, value: model };
                })}
                selectedValue={selectedModel}
                onChange={handleChangeOnModelSelect}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
          <div className="flex-col">
            <h4 className="text-gray-200 font-normal mb-0">
              Attach Local Model
            </h4>
            <p className="text-gray-100 text-xs">
              Attach a local HuggingFace model.
            </p>
          </div>
          <div className="flex">
            <Button
              className="flex justify-between items-center w-[80px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
              onClick={() => setIsNewLocalEmbeddingModelModalOpen(true)}
              placeholder=""
            >
              Attach
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center w-full gap-5 border-b-2 border-solid border-neutral-700 border-0 pb-2">
          <div className="flex-col">
            <h4 className="text-gray-200 font-normal mb-0">
              Download Remote Model
            </h4>
            <p className="text-gray-100 text-xs">
              Reor will download a HuggingFace embedding model for you.
            </p>
          </div>
          <div className="flex">
            <Button
              className="flex justify-between items-center w-[80px] py-2 border border-gray-300 rounded-md border-none cursor-pointer bg-dark-gray-c-eight hover:bg-dark-gray-c-ten font-normal"
              onClick={() => setIsContextLengthModalOpen(true)}
              placeholder=""
            >
              Attach
            </Button>
          </div>
        </div>
        <ChunkSizeSettings>
          <div className="flex-col">
            <h4 className="text-gray-200 font-normal mb-0">
              Change Chunk Size
            </h4>
            <p className="text-gray-100 text-xs">
              A larger chunk size means more context is fed to the model at the
              cost of &quot;needle in a haystack&quot; effects.
            </p>
          </div>
        </ChunkSizeSettings>
      </div>
      {/* Warning message at the bottom */}
      <p className=" text-gray-100 text-xs">
        <i>
          Note: If you notice some lag in the editor it is likely because you
          chose too large of a model...
        </i>
      </p>{" "}
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
