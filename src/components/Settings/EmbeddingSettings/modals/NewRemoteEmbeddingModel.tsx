import React, { useState } from "react";

import { Button } from "@material-tailwind/react";
import { EmbeddingModelWithRepo } from "electron/main/electron-store/storeConfig";
import posthog from "posthog-js";

import ExternalLink from "../../../Common/ExternalLink";
import ReorModal from "../../../Common/Modal";

interface NewRemoteEmbeddingModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleUserHasChangedModel?: () => void;
}

const NewRemoteEmbeddingModelModal: React.FC<
  NewRemoteEmbeddingModelModalProps
> = ({ isOpen, onClose, handleUserHasChangedModel }) => {
  const [huggingfaceRepo, setHuggingfaceRepo] = useState("");

  const saveModelConfigToElectronStore = async () => {
    if (!huggingfaceRepo) {
      onClose();
      return;
    }

    const modelObject: EmbeddingModelWithRepo = {
      type: "repo",
      repoName: huggingfaceRepo,
    };

    await window.electronStore.addNewRepoEmbeddingModel(modelObject);
    posthog.capture("save_repo_embedding_model", {
      modelRepo: huggingfaceRepo,
    });
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel();
    }
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveModelConfigToElectronStore();
    }
  };

  return (
    <ReorModal
      isOpen={isOpen}
      onClose={saveModelConfigToElectronStore}
      width="500px"
    >
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h2 className="text-white  font-semibold mb-0">Set up remote model</h2>
        <p className="text-white text-sm mb-6 mt-2 text-xs">
          Provide the repo name from Hugging Face like
          &quot;Xenova/roberta-base-squad2&quot;.
        </p>

        <input
          type="text"
          className="block w-full px-3 py-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
          value={huggingfaceRepo}
          onChange={(e) => setHuggingfaceRepo(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Embedding Model Repo"
        />
        <p className="text-white text-xs mb-2 mt-2 italic">
          <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
            {" "}
            This page on Hugging Face
          </ExternalLink>{" "}
          has most available models. It must be a &quot;Xenova&quot; ONNX
          embedding model. Check out{" "}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">
            this guide
          </ExternalLink>{" "}
          for more info.{" "}
        </p>

        <div className="w-full flex justify-end pb-2">
          <Button
            className="bg-blue-300 border-none h-8 hover:bg-blue-400 cursor-pointer w-[120px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
            onClick={saveModelConfigToElectronStore}
            placeholder=""
          >
            Attach Remote
          </Button>
        </div>
      </div>
    </ReorModal>
  );
};

export default NewRemoteEmbeddingModelModal;
