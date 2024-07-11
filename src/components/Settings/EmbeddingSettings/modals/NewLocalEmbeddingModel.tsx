import React, { useState } from "react";

import { Button } from "@material-tailwind/react";
import { EmbeddingModelWithLocalPath } from "electron/main/electron-store/storeConfig";
import posthog from "posthog-js";
import { IconContext } from "react-icons";
import { CiFileOn } from "react-icons/ci";
import { FaUpload, FaRegTrashAlt } from "react-icons/fa";

import ExternalLink from "../../../Common/ExternalLink";
import ReorModal from "../../../Common/Modal";

interface NewLocalEmbeddingModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleUserHasChangedModel?: () => void;
}

const NewLocalEmbeddingModelModal: React.FC<
  NewLocalEmbeddingModelModalProps
> = ({ isOpen, onClose, handleUserHasChangedModel }) => {
  const [newModelPath, setNewModelPath] = useState<string>("");

  const handleModelDirectorySelection = async () => {
    const paths = await window.fileSystem.openDirectoryDialog();
    if (paths && paths.length > 0) {
      setNewModelPath(paths[0]);
    }
  };
  const saveModelConfigToElectronStore = async () => {
    if (!newModelPath) {
      onClose();
      return;
    }

    const modelObject: EmbeddingModelWithLocalPath = {
      type: "local",
      localPath: newModelPath,
    };

    await window.electronStore.addNewLocalEmbeddingModel(modelObject);
    posthog.capture("save_local_embedding_model", {
      modelPath: newModelPath,
    });
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel();
    }
    onClose();
  };

  const handleSelectionDelete = () => {
    setNewModelPath("");
  };

  return (
    <ReorModal isOpen={isOpen} onClose={saveModelConfigToElectronStore}>
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h3 className="text-white font-semibold mb-0">
          Upload and attach local model
        </h3>
        <p className="text-white text-xs mb-6 mt-2">
          Download a ONNX embedding model and select its directory below:
        </p>

        <Button
          className="bg-dark-gray-c-one h-[164px] hover:bg-dark-gray-c-two cursor-pointer w-full border-dotted text-center pt-0 pb-0 pr-2 pl-2 mt-1 mb-1 flex flex-col justify-center items-center"
          onClick={handleModelDirectorySelection}
          placeholder=""
        >
          <div className="border-solid border-2 rounded-full p-3 border-black-100">
            <FaUpload size={20} />
          </div>
          <p className="font-bold text-blue-200">Click to Upload</p>
        </Button>
        <p className="text-white text-xs my-4 italic">
          <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
            This page on Hugging Face{" "}
          </ExternalLink>
          has most available models. It must be a &quot;Xenova&quot; ONNX
          embedding model. Check out{" "}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">
            this guide
          </ExternalLink>{" "}
          for more info.{" "}
        </p>
        {newModelPath && (
          <div className="w-full p-1 border-solid border-1 border-dark-gray-c-one rounded-lg flex items-center">
            <IconContext.Provider value={{ color: "salmon" }}>
              <CiFileOn size={30} className="mx-3" />
            </IconContext.Provider>

            <p className="mt-2 text-xs text-gray-100">
              Selected: <strong>{newModelPath}</strong>
            </p>
            <IconContext.Provider value={{ color: "white" }}>
              <FaRegTrashAlt
                size={20}
                className="mr-4 hover:cursor-pointer"
                onClick={handleSelectionDelete}
              />
            </IconContext.Provider>
          </div>
        )}
        <div className="flex justify-between gap-3 pb-2">
          <Button
            className="bg-transparent border-2 border-blue-300 h-8 hover:bg-blue-400 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-3 rounded"
            onClick={onClose}
            placeholder=""
          >
            Discard
          </Button>
          <Button
            className="bg-blue-400 h-8 hover:bg-transparent border-2 border-blue-800 cursor-pointer w-full text-center pt-0 pb-0 pr-2 pl-2 mt-3 rounded"
            onClick={saveModelConfigToElectronStore}
            placeholder=""
          >
            Attach files
          </Button>
        </div>
      </div>
    </ReorModal>
  );
};

export default NewLocalEmbeddingModelModal;
