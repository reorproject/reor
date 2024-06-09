import React, { useState } from "react";

import Modal from "../Generic/Modal";

import AnalyticsSettings from "./AnalyticsSettings";
import ChunkSizeSettings from "./ChunkSizeSettings";
import EmbeddingModelSettings from "./EmbeddingSettings";
import LLMSettings from "./LLMSettings";
import RagSettings from "./RagSettings";
import TextGenerationSettings from "./TextGenerationSettings";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum SettingsTab {
  LLMSettings = "llmSettings",
  EmbeddingModel = "embeddingModel",
  TextGeneration = "textGeneration",
  RAG = "RAG",
  ANALYTICS = "analytics",
  ChunkSize = "chunkSize",
}

const SettingsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose: onCloseFromParent,
}) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false);
  const [activeTab, setActiveTab] = useState("llmSettings");

  const handleSave = () => {
    if (willNeedToReIndex) {
      console.log("reindexing files");
      window.database.indexFilesInDirectory();
    }
    onCloseFromParent();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleSave();
      }}
    >
      <div className="mt-0 flex w-[600px] ">
        <div className="flex flex-col ml-2 mb-2 pr-1 w-[100px]  bg-neutral-800 text-white border-r-[0.1px] border-gray-700 border-solid border-b-0 border-t-0 border-l-0">
          <div
            className={`flex items-center mt-2 rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.LLMSettings
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.LLMSettings)}
          >
            LLM
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.EmbeddingModel
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.EmbeddingModel)}
          >
            Embedding Model
          </div>

          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.TextGeneration
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.TextGeneration)}
          >
            Text Generation{" "}
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.RAG
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.RAG)}
          >
            RAG{" "}
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.ANALYTICS
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.ANALYTICS)}
          >
            Analytics{" "}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 ml-2">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === SettingsTab.LLMSettings && (
            <div className="mt-2 w-full">
              <LLMSettings />
            </div>
          )}
          {activeTab === SettingsTab.EmbeddingModel && (
            <div className="w-full">
              <EmbeddingModelSettings
                handleUserHasChangedModel={() => setWillNeedToReIndex(true)}
              />
            </div>
          )}


          {activeTab === SettingsTab.TextGeneration && (
            <div className="w-full">
              <TextGenerationSettings />
            </div>
          )}

          {activeTab === SettingsTab.ANALYTICS && (
            <div className="w-full">
              <AnalyticsSettings />
            </div>
          )}

          {activeTab === SettingsTab.RAG && (
            <div className="w-full">
              <RagSettings>
                <h2 className="text-2xl font-semibold mb-0 text-white">RAG</h2>{" "}
                <p className="mt-2 text-sm text-gray-100 mb-1">
                  Number of notes to feed to the LLM during Q&A:
                </p>
              </RagSettings>
              <ChunkSizeSettings>
                <p className="mt-2 text-sm text-gray-100 mb-1">
                  Change the Chunk Size:
                </p>
              </ChunkSizeSettings>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
