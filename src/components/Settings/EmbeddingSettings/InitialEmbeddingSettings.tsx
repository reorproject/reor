import React, { useState, useEffect } from "react";

import { EmbeddingModelConfig } from "electron/main/Store/storeConfig";

import NewEmbeddingModelModalBothTypes from "./modals/NewEmbeddingModelBothTypes";

import CustomSelect from "@/components/Generic/Select";

// import { modelRepos } from "./EmbeddingSettings";

// export const modelRepos = [
//   {
//     label: "bge-base-en-v1.5 (medium, recommended)",
//     value: "Xenova/bge-base-en-v1.5",
//   },
//   { label: "UAE-Large-V1 (large) ", value: "Xenova/UAE-Large-V1" },
//   { label: "bge-small-en-v1.5 (small)", value: "Xenova/bge-small-en-v1.5" },
// ];
interface InitialEmbeddingModelSettingsProps {
  // handleUserHasCompleted?: (completed: boolean) => void;
  // handleUserHasChangedModel?: (bool: boolean) => void;
  // userTriedToSubmit?: boolean;
  setErrorMsg: (msg: string) => void;
}
const InitialEmbeddingModelSettings: React.FC<
  InitialEmbeddingModelSettingsProps
> = ({
  // handleUserHasCompleted,
  // handleUserHasChangedModel,
  // userTriedToSubmit,
  setErrorMsg,
}) => {
  // const [currentError, setCurrentError] = useState<string>("");

  const [selectedModel, setSelectedModel] = useState<string>("");
  const [embeddingModels, setEmbeddingModels] = useState<
    Record<string, EmbeddingModelConfig>
  >({});
  const [showNewEmbeddingModelModal, setShowNewEmbeddingModelModal] =
    useState<boolean>(false);
  // useEffect(() => {
  //   const defaultModel = window.electronStore.getDefaultEmbeddingModel();
  //   if (defaultModel) {
  //     setSelectedModel(defaultModel);
  //   }
  //   // else {
  //   //   setSelectedModel(modelRepos[0].value);
  //   //   // window.electronStore.setDefaultEmbeddingModel(modelRepos[0].value);
  //   //   if (handleUserHasChangedModel) {
  //   //     handleUserHasChangedModel(true);
  //   //   }
  //   // }
  // }, []);
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

  useEffect(() => {
    if (selectedModel) {
      setErrorMsg("");
    } else {
      setErrorMsg("No embedding model selected");
    }
  }, [selectedModel]);

  const handleChangeOnModelSelect = (newSelectedModel: string) => {
    setSelectedModel(newSelectedModel);
    window.electronStore.setDefaultEmbeddingModel(newSelectedModel);
    // if (handleUserHasChangedModel) {
    //   handleUserHasChangedModel(true);
    // }
  };

  return (
    <div className="w-full bg-dark-gray-c-three rounded flex justify-between items-center">
      <p className="mb-2 pb-3 text-gray-100">Embedding Model</p>{" "}
      {/* <CustomSelect
        options={modelRepos}
        value={selectedModel}
        onChange={handleChangeOnModelSelect}
      /> */}
      <CustomSelect
        options={Object.keys(embeddingModels).map((model) => {
          return { label: model, value: model };
        })}
        selectedValue={selectedModel}
        onChange={handleChangeOnModelSelect}
        addButton={{
          label: "Attach a Custom Embedding Model",
          onClick: () => setShowNewEmbeddingModelModal(true),
        }}
      />
      <NewEmbeddingModelModalBothTypes
        isOpen={showNewEmbeddingModelModal}
        onClose={() => {
          setShowNewEmbeddingModelModal(false);
        }}
        handleUserHasChangedModel={() => {
          updateEmbeddingModels();
        }}
      />
    </div>
  );
};

export default InitialEmbeddingModelSettings;
