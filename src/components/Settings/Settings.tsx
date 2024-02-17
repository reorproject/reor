import React, { useState } from "react";
import Modal from "../Generic/Modal";
import LLMSettings from "./LLMSettings";
import EmbeddingModelManager from "./EmbeddingSettings";
import RagSettings from "./RagSettings";
import { Button } from "@material-tailwind/react";
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  windowVaultDirectory: string;
}

type TabName = "llmSettings" | "embeddingModel" | "RAG" | "vault"; // Define the type for tab names

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose: onCloseFromParent,
  windowVaultDirectory,
}) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false);
  const [activeTab, setActiveTab] = useState<TabName>("llmSettings");
  const [userDirectory, setUserDirectory] = useState<string>("");

  const handleSave = () => {
    if (willNeedToReIndex) {
      window.database.indexFilesInDirectory(windowVaultDirectory);
    }
    onCloseFromParent();
  };

  const handleDirectorySelection = async () => {
    const paths = await window.files.openDirectoryDialog();
    if (paths && paths[0]) {
      setUserDirectory(paths[0]);
      window.electronStore.openNewVaultDirectory(userDirectory);
      onCloseFromParent();
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
      <div className="mt-0 flex w-[600px] ">
        <div className="flex flex-col ml-2 mb-2 pr-1 w-[100px]  bg-gray-800 text-white border-r-[0.1px] border-gray-700 border-solid border-b-0 border-t-0 border-l-0">
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
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 text-sm ${
              activeTab === "vault"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab("vault")}
          >
            Vault{" "}
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-gray-600 text-sm ${
              activeTab === "RAG"
                ? "bg-gray-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab("RAG")}
          >
            RAG{" "}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 ml-2">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === "llmSettings" && (
            <div className="mt-2 w-full">
              <LLMSettings />
            </div>
          )}
          {activeTab === "embeddingModel" && (
            <div className="w-full">
              <EmbeddingModelManager
                handleUserHasChangedModel={setWillNeedToReIndex}
                childrenBelowDropdown={
                  <p className=" text-gray-100 text-xs">
                    <i>
                      If you notice some lag in the editor it is likely because
                      you chose too large of a model...
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

          {activeTab === "vault" && (
            <div className="w-full">
              <h2 className="text-2xl font-semibold mb-0 text-white">Vault</h2>
              <p className="mt-2 text-sm text-gray-100 mb-1">
                Open a new vault directory in another window:
              </p>

              <div>
                <Button
                  className="bg-slate-700 mt-2 border-none h-10 hover:bg-slate-900 cursor-pointer w-[140px] text-center pt-0 pb-0 pr-2 pl-2"
                  onClick={handleDirectorySelection}
                  placeholder=""
                >
                  Open Directory
                </Button>
                {userDirectory && (
                  <p className="mt-2 text-xs text-gray-100">
                    Selected: <strong>{userDirectory}</strong>
                  </p>
                )}
              </div>
              {/* <p className="mt-2 text-xs text-gray-100 ">
                This will open in a new window.
              </p> */}
              {/* {userDirectory && (
                <Button
                  className="bg-slate-700  border-none h-10 hover:bg-slate-900 cursor-pointer w-[140px] text-center pt-0 pb-0 pr-2 pl-2"
                  onClick={() => {
                    window.electronStore.openNewVaultDirectory(userDirectory);
                    onCloseFromParent();
                  }}
                  placeholder=""
                >
                  Open New Vault
                </Button>
              )} */}
            </div>
          )}

          {activeTab === "RAG" && (
            <div className="w-full">
              <RagSettings>
                <h2 className="text-2xl font-semibold mb-0 text-white">RAG</h2>{" "}
                <p className="mt-2 text-sm text-gray-100 mb-1">
                  Number of notes to feed to the LLM during Q&A:
                </p>
              </RagSettings>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
