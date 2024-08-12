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
  AnalyticsTab = 'analytics',
}

const SettingsModal: React.FC<ModalProps> = ({ isOpen, onClose: onCloseFromParent }) => {
  const [willNeedToReIndex, setWillNeedToReIndex] = useState(false)
  const [activeTab, setActiveTab] = useState(SettingsTab.GeneralSettingsTab)

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
    >
      <div className="flex h-[80vh] w-[80vw] md:w-[70vw] lg:w-[50vw] ">
        <div className="flex w-[150px] flex-col rounded-l-lg border-y-0 border-l-0 border-r-[0.1px] border-solid border-gray-700 bg-dark-gray-c-seven p-2 text-white">
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
              activeTab === SettingsTab.AnalyticsTab ? 'bg-neutral-700 font-semibold text-white' : 'text-gray-200'
            }`}
            onClick={() => setActiveTab(SettingsTab.AnalyticsTab)}
          >
            Analytics{' '}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="ml-2 flex-1 overflow-y-auto px-4 lg:px-12">
          {/* <h2 className="text-2xl font-semibold mb-4 text-white">Settings</h2> */}
          {activeTab === SettingsTab.GeneralSettingsTab && <GeneralSettings />}
          {activeTab === SettingsTab.LLMSettingsTab && <LLMSettings />}
          {activeTab === SettingsTab.EmbeddingModelTab && (
            <EmbeddingModelSettings handleUserHasChangedModel={() => setWillNeedToReIndex(true)} />
          )}

          {activeTab === SettingsTab.TextGenerationTab && <TextGenerationSettings />}

          {activeTab === SettingsTab.AnalyticsTab && <AnalyticsSettings />}
        </div>
      </div>
    </ReorModal>
  )
}

export default SettingsModal
