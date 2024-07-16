import React, { useState } from 'react'

import ReorModal from '../Common/Modal'

import AnalyticsSettings from './AnalyticsSettings'
import EmbeddingModelSettings from './EmbeddingSettings/EmbeddingSettings'
import GeneralSettings from './GeneralSettings'
import LLMSettings from './LLMSettings/LLMSettings'
import TextGenerationSettings from './TextGenerationSettings'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
}

enum SettingsTab {
  GeneralSettings = "generalSettings",
  LLMSettings = "llmSettings",
  EmbeddingModel = "embeddingModel",
  TextGeneration = "textGeneration",
  // RAG = "RAG",
  ANALYTICS = "analytics",
  ChunkSize = "chunkSize",
}

const SettingsModal: React.FC<ModalProps> = ({
  isOpen,
  onClose: onCloseFromParent,
}) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false);
  const [activeTab, setActiveTab] = useState("generalSettings");

  const handleSave = () => {
    if (willNeedToReIndex) {
      window.database.indexFilesInDirectory()
    }
    onCloseFromParent()
  }

  if (!isOpen) return null

  return (
    <ReorModal
      isOpen={isOpen}
      onClose={() => {
        handleSave()
      }}
      widthType={"settingsContainer"}
    >
      <div className="flex w-full h-[800px]">
        <div className="flex flex-col w-[200px] h-full bg-dark-gray-c-seven text-white border-r-[0.1px] border-gray-700 border-solid border-b-0 border-t-0 border-l-0 p-2">
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
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.LLM ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.LLM)}
          >
            LLM
          </div>
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.EmbeddingModel ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.EmbeddingModel)}
          >
            Embedding Model
          </div>

          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.TextGeneration ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.TextGeneration)}
          >
            Text Generation{' '}
          </div>
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.ANALYTICS ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.ANALYTICS)}
          >
            Analytics{' '}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-full h-full flex-1 ml-2 pl-16 pr-16">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === SettingsTab.General && (
            <div className="size-full">
              <GeneralSettings />
            </div>
          )}
          {activeTab === SettingsTab.LLM && (
            <div className="size-full">
              <LLMSettings />
            </div>
          )}
          {activeTab === SettingsTab.EmbeddingModel && (
            <div className="size-full">
              <EmbeddingModelSettings handleUserHasChangedModel={() => setWillNeedToReIndex(true)} />
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
        </div>
      </div>
    </ReorModal>
  )
}

export default SettingsModal
