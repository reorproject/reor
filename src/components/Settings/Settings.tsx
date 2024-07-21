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
  GeneralSettingsTab = 'generalSettings',
  LLMSettingsTab = 'llmSettings',
  EmbeddingModelTab = 'embeddingModel',
  TextGenerationTab = 'textGeneration',
  // RAG = "RAG",
  ANALYTICSTab = 'analytics',
  ChunkSizeTab = 'chunkSize',
}

const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose: onCloseFromParent }) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false)
  const [activeTab, setActiveTab] = useState('generalSettings')

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
      widthType="settingsContainer"
    >
      <div className="flex w-[900px] md:h-[600px] lg:h-[600px] xl:h-[800px]">
        <div className="flex h-full w-[200px] flex-col border-y-0 border-l-0 border-r-[0.1px] border-solid border-gray-700 bg-dark-gray-c-seven p-2 text-white">
          <div
            className={`mt-2 flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.GeneralSettingsTab ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.GeneralSettingsTab)}
          >
            General
          </div>
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.LLMSettingsTab ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.LLMSettingsTab)}
          >
            LLM
          </div>
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.EmbeddingModelTab ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.EmbeddingModelTab)}
          >
            Embedding Model
          </div>

          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.TextGenerationTab ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.TextGenerationTab)}
          >
            Text Generation{' '}
          </div>
          <div
            className={`flex cursor-pointer items-center rounded border-b border-gray-200 p-2 text-sm hover:bg-neutral-600 ${
              activeTab === SettingsTab.ANALYTICSTab ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.ANALYTICSTab)}
          >
            Analytics{' '}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="ml-2 size-full flex-1 px-16">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === SettingsTab.GeneralSettingsTab && (
            <div className="size-full">
              <GeneralSettings />
            </div>
          )}
          {activeTab === SettingsTab.LLMSettingsTab && (
            <div className="size-full">
              <LLMSettings />
            </div>
          )}
          {activeTab === SettingsTab.EmbeddingModelTab && (
            <div className="size-full">
              <EmbeddingModelSettings handleUserHasChangedModel={() => setWillNeedToReIndex(true)} />
            </div>
          )}

          {activeTab === SettingsTab.TextGenerationTab && (
            <div className="w-full">
              <TextGenerationSettings />
            </div>
          )}

          {activeTab === SettingsTab.ANALYTICSTab && (
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
