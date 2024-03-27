import React, { useState } from "react";
import { Button } from "@material-tailwind/react";
import Modal from "../../Generic/Modal";
import ExternalLink from "../../Generic/ExternalLink";
import { EmbeddingModelWithLocalPath } from "electron/main/Store/storeConfig";

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
    const paths = await window.files.openDirectoryDialog();
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
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={saveModelConfigToElectronStore}>
      <div className="w-[400px] ml-2 mr-2 mb-2 pl-3">
        <h2 className="text-white  font-semibold mb-0">
          New Local Embedding Model
        </h2>
        <p className="text-white text-sm mb-2 mt-2">
          Download a ONNX embedding model and select its directory below:
        </p>

        <Button
          className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer w-[180px] text-center pt-0 pb-0 pr-2 pl-2 mt-1 mb-1"
          onClick={handleModelDirectorySelection}
          placeholder=""
        >
          Select Model Directory
        </Button>
        <p className="text-white text-xs mb-2 mt-2 italic">
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
          <p className="mt-2 text-xs text-gray-100">
            Selected: <strong>{newModelPath}</strong>
          </p>
        )}

        <Button
          className="bg-orange-700 border-none h-8 hover:bg-orange-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2 mt-3"
          onClick={saveModelConfigToElectronStore}
          placeholder=""
        >
          Load
        </Button>
      </div>
    </Modal>
  );
};

export default NewLocalEmbeddingModelModal;
