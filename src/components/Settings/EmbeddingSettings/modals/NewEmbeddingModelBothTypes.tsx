import React, { useState } from "react";

import { Button } from "@material-tailwind/react";
import {
  EmbeddingModelWithLocalPath,
  EmbeddingModelWithRepo,
} from "electron/main/Store/storeConfig";

import ExternalLink from "../../../Generic/ExternalLink";
import Modal from "../../../Generic/Modal";

interface NewLocalEmbeddingModelModalBothTypesProps {
  isOpen: boolean;
  onClose: () => void;
  handleUserHasChangedModel?: () => void;
}

const NewEmbeddingModelModalBothTypes: React.FC<
  NewLocalEmbeddingModelModalBothTypesProps
> = ({ isOpen, onClose, handleUserHasChangedModel }) => {
  // const [newModelPath, setNewModelPath] = useState<string>("");
  const [huggingfaceRepo, setHuggingfaceRepo] = useState("");
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);

  const handleModelDirectorySelection = async () => {
    const paths = await window.fileSystem.openDirectoryDialog();
    if (paths && paths.length > 0) {
      // setNewModelPath(paths[0]);
      const modelObject: EmbeddingModelWithLocalPath = {
        type: "local",
        localPath: paths[0],
      };

      await window.electronStore.addNewLocalEmbeddingModel(modelObject);
      if (handleUserHasChangedModel) {
        handleUserHasChangedModel();
      }
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // saveModelConfigToElectronStore();
    }
  };

  const handleSaveHuggingFaceRepo = async () => {
    if (!huggingfaceRepo) {
      setIsRepoModalOpen(false);
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
    setIsRepoModalOpen(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h2 className="text-white  font-semibold mb-0">
          Attach a custom embedding model
        </h2>
        <p className="text-white text-sm mb-2 mt-2">
          You can either attach a local embedding model or provide a Hugging
          Face repo name to be downloaded:
        </p>
        <div className="flex">
          <Button
            className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer w-[180px] text-center pt-0 pb-0 pr-2 pl-2 mt-1 mr-2"
            onClick={handleModelDirectorySelection}
            placeholder=""
          >
            Attach Local Model
          </Button>
          <Button
            className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer w-[180px] text-center pt-0 pb-0 pr-2 pl-2 mt-1"
            onClick={() => {
              setIsRepoModalOpen(true);
            }}
            placeholder=""
          >
            Download by Repo name
          </Button>
        </div>
        <p className="text-white text-xs mb-2 mt-2 italic">
          <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
            This page on Hugging Face
          </ExternalLink>{" "}
          has most available models. It must be a &quot;Xenova&quot; ONNX
          embedding model. Check out{" "}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">
            this guide
          </ExternalLink>
          for more info.{" "}
        </p>

        <Modal
          isOpen={isRepoModalOpen}
          onClose={() => {
            handleSaveHuggingFaceRepo();
          }}
        >
          <div className="w-[300px] ml-2 mr-2 mb-2 pl-3 pt-1">
            <h3 className="font-semibold mb-3 text-white">
              Download by Repo name
            </h3>
            {/* <p className="text-gray-100 mb-3 mt-2 text-sm">
              This will download the embedding model from Hugging Face.
            </p> */}
            <input
              type="text"
              className="block w-full px-3 py-2 mt-2 border border-gray-300 box-border rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out"
              value={huggingfaceRepo}
              onChange={(e) => setHuggingfaceRepo(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Xenova/roberta-base-squad2"
            />
            {/* <p className="text-gray-100 text-xs mb-2 mt-2 italic">
              <ExternalLink
                url="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova"
                label="This page on Hugging Face"
              />{" "}
              has most available models. It must be a &quot;Xenova&quot; ONNX
              embedding model.
            </p> */}
            <Button
              className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
              onClick={() => {
                if (huggingfaceRepo) handleSaveHuggingFaceRepo();
              }}
              placeholder=""
            >
              Download
            </Button>
          </div>
        </Modal>
      </div>
    </Modal>
  );
};

export default NewEmbeddingModelModalBothTypes;
