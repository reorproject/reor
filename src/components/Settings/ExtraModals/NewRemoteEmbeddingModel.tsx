import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../../Generic/Modal";
import ExternalLink from "../../Generic/ExternalLink";
import { EmbeddingModelWithRepo } from "electron/main/Store/storeConfig";

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
    <Modal isOpen={isOpen} onClose={saveModelConfigToElectronStore}>
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h2 className="text-white  font-semibold mb-0">
          New Remote Embedding Model
        </h2>
        <p className="text-white text-sm mb-2 mt-1">
          Provide the repo name from Huggingface. An example is
          &quot;xenova/roberta-base-squad2&quot;.
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
          {" "}
          This{" "}
          <ExternalLink
            url="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=trending&search=xenova"
            label="link"
          />{" "}
          has some suitable choices. This must be a &quot;Xenova&quot; ONNX
          model.
        </p>

        <Button
          className="bg-slate-700 border-none h-8 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
          onClick={saveModelConfigToElectronStore}
          placeholder=""
        >
          Load
        </Button>
      </div>
    </Modal>
  );
};

export default NewRemoteEmbeddingModelModal;
