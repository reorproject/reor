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
  GeneralSettings = 'generalSettings',
  LLMSettings = 'llmSettings',
  EmbeddingModel = 'embeddingModel',
  TextGeneration = 'textGeneration',
  // RAG = "RAG",
  ANALYTICS = 'analytics',
}

const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose: onCloseFromParent }) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.LLMSettings)

  const handleSave = () => {
    if (willNeedToReIndex) {
      console.log('reindexing files')
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
    >
      <div className="flex h-[600px] w-[850px]">
        <div className="flex h-full w-[150px] flex-col border-y-0 border-l-0 border-r-[0.1px] border-solid border-gray-700 bg-dark-gray-c-seven p-2 text-white">
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.LLMSettings ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.LLMSettings)}
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
          {/* <div
            className={`flex items-center rounded cursor-pointer p-2 border-b border-gray-200 hover:bg-neutral-600 text-sm ${
              activeTab === SettingsTab.RAG
                ? "bg-neutral-700 text-white font-semibold"
                : "text-gray-200"
            }`}
            onClick={() => setActiveTab(SettingsTab.RAG)}
          >
            RAG{" "}
          </div> */}
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.ANALYTICS ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.ANALYTICS)}
          >
            Analytics{' '}
          </div>
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.GeneralSettings ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.GeneralSettings)}
          >
            General{' '}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="ml-2 size-full flex-1 px-16">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === SettingsTab.GeneralSettings && (
            <div className="size-full">
              <GeneralSettings />
            </div>
          )}
          {activeTab === SettingsTab.LLMSettings && (
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
