import React, { useState } from "react";

import Modal from "../Generic/Modal";

import AnalyticsSettings from "./AnalyticsSettings";
import ChunkSizeSettings from "./ChunkSizeSettings";
import EmbeddingModelSettings from "./EmbeddingSettings";
import GeneralSettings from "./GeneralSettings";
import LLMSettings from "./LLMSettings";
import RagSettings from "./RagSettings";
import TextGenerationSettings from "./TextGenerationSettings";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

enum SettingsTab {
  GeneralSettings = "generalSettings",
  LLMSettings = "llmSettings",
  EmbeddingModel = "embeddingModel",
  TextGeneration = "textGeneration",
  RAG = "RAG",
  ANALYTICS = "analytics",
  GENERAL = "general",
}

const SettingsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose: onCloseFromParent,
}) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false);
  const [activeTab, setActiveTab] = useState("generalSettings");

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
      <div className="flex w-full h-full">
        <div className="flex flex-col w-[150px] h-[600px] bg-dark-gray-c-seven text-white border-r-[0.1px] border-gray-700 border-solid border-b-0 border-t-0 border-l-0 p-2">
          <div
            className={`flex items-center mt-2 rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.GeneralSettings
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.GeneralSettings)}
          >
            General
          </div>
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
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
          <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.GENERAL
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.GENERAL)}
          >
            General{" "}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full h-[600px] flex-1 ml-2 pl-16 pr-16">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === SettingsTab.GeneralSettings && (
            <div className="w-full h-full">
              <GeneralSettings />
            </div>
          )}
          {activeTab === SettingsTab.LLMSettings && (
            <div className="w-full h-full">
              <LLMSettings />
            </div>
          )}
          {activeTab === SettingsTab.EmbeddingModel && (
            <div className="w-full h-full">
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
              <h2 className="text-2xl font-semibold mb-5 text-white">RAG</h2>{" "}
              <RagSettings>
                <p className="mt-5 text-sm text-gray-100 mb-1 flex pb-3">
                  Number of notes to feed to the LLM during Q&A
                </p>
              </RagSettings>
              <ChunkSizeSettings>
                <p className="mt-5 text-sm text-gray-100 mb-1 flex pb-3">
                  Change the Chunk Size
                </p>
              </ChunkSizeSettings>
            </div>
          )}

          {activeTab === SettingsTab.GENERAL && (
            <div className="w-full">
              <GeneralSettings />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
