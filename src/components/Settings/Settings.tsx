import React, { useEffect, useState } from "react";
import Modal from "../Generic/Modal";
import { Button } from "@material-tailwind/react";
import LLMSettings from "./LLMSettings";
import EmbeddingModelManager from "./EmbeddingSettings";
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose: onCloseFromParent,
}) => {
  const [openAIKey, setOpenAIKey] = useState("");
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false);
  const [activeTab, setActiveTab] = useState("llmSettings");

  useEffect(() => {
    const key = window.electronStore.getOpenAIAPIKey() || ""; // Fallback to empty string if undefined
    setOpenAIKey(key);
  }, []);

  const handleSave = () => {
    window.electronStore.setOpenAIAPIKey(openAIKey);

    if (willNeedToReIndex) {
      window.database.indexFilesInDirectory();
    }
    onCloseFromParent();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleSave();
        // onCloseFromParent();
      }}
    >
      <div className=" mt-0  flex w-[600px] ">
        <div className="flex flex-col ml-2 pr-1 w-[100px]  bg-gray-800 text-white border-r-[0.1px] border-gray-700 border-solid border-b-0 border-t-0 border-l-0">
          <div
            className={`flex items-center mt-2 rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 text-sm ${
              activeTab === "llmSettings"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab("llmSettings")}
          >
            LLM
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 text-sm ${
              activeTab === "embeddingModel"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab("embeddingModel")}
          >
            Embedding Model
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 ml-2">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}

          {activeTab === "embeddingModel" && (
            <div className="w-full">
              <EmbeddingModelManager
                handleUserHasChangedModel={setWillNeedToReIndex}
                childrenBelowDropdown={
                  <p className=" text-gray-100 text-xs">
                    <i>
                      And if you notice some lag it is likely because you chose
                      too large of a model...
                    </i>
                  </p>
                }
              >
                <h2 className="text-2xl font-semibold mb-0 text-white">
                  Embedding Model
                </h2>{" "}
                <p className="mt-5 text-gray-100">
                  If you change this, your files will be re-indexed:
                </p>
                {/* <EmbeddingModelManager.childrenBelowDropdown> */}
                {/* </EmbeddingModelManager.childrenBelowDropdown> */}
              </EmbeddingModelManager>
            </div>
          )}

          {activeTab === "llmSettings" && (
            <div className="mt-2 w-full">
              <LLMSettings />
            </div>
          )}

          <Button
            className="bg-slate-700 mt-0 mb-2 border-none h-10 hover:bg-slate-900 cursor-pointer w-[80px] text-center pt-0 pb-0 pr-2 pl-2"
            onClick={handleSave}
            placeholder=""
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
