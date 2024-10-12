import { useState } from 'react'

export enum SettingsTab {
  GeneralSettingsTab = 'generalSettings',
  LLMSettingsTab = 'llmSettings',
  EmbeddingModelTab = 'embeddingModel',
  TextGenerationTab = 'textGeneration',
  AnalyticsTab = 'analytics',
}

const useModalState = () => {
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.GeneralSettingsTab)

  const openModalWithTab = (tab: SettingsTab) => {
    setActiveTab(tab)
    setSettingsModalOpen(true)
  }

  const closeModal = () => {
    setSettingsModalOpen(false)
  }

  return {
    isSettingsModalOpen,
    activeTab,
    openModalWithTab,
    closeModal,
  }
}

export default useModalState
