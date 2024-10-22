import React, { useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SettingsModal, { SettingsTab } from '../Settings'

interface LLMSelectOrButtonProps {
  llmConfigs: Array<{ modelName: string }>
  selectedLLM: string
  setSelectedLLM: (value: string) => void
  setLLMConfigs: React.Dispatch<React.SetStateAction<LLMConfig[]>>
}

const LLMSelectOrButton: React.FC<LLMSelectOrButtonProps> = ({
  llmConfigs,
  selectedLLM,
  setSelectedLLM,
  setLLMConfigs,
}) => {
  const handleLLMChange = (value: string) => {
    setSelectedLLM(value)
  }

  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<SettingsTab>(SettingsTab.GeneralSettingsTab)

  const openModalWithTab = (tab: SettingsTab) => {
    setActiveTab(tab)
    setSettingsModalOpen(true)
  }

  const closeModal = () => {
    setSettingsModalOpen(false)
  }

  const openLLMSettings = () => {
    openModalWithTab(SettingsTab.LLMSettingsTab)
  }

  const refreshLLMConfigs = async () => {
    const LLMConfigs = await window.llm.getLLMConfigs()
    setLLMConfigs(LLMConfigs)
  }

  return (
    <div className="text-left">
      <div className="flex items-center">
        {llmConfigs.length === 0 ? (
          <Button className="bg-transparent text-primary hover:bg-slate-700" onClick={openLLMSettings}>
            Attach LLM
          </Button>
        ) : (
          <Select value={selectedLLM} onValueChange={(value) => handleLLMChange(value)}>
            <SelectTrigger className="w-32 ">
              <SelectValue placeholder="Select LLM" />
            </SelectTrigger>
            <SelectContent>
              {llmConfigs.map((llm) => (
                <SelectItem key={llm.modelName} value={llm.modelName}>
                  {llm.modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <FiRefreshCw onClick={refreshLLMConfigs} className="ml-1 cursor-pointer text-xs text-gray-400" />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={closeModal} initialTab={activeTab} />
      </div>
    </div>
  )
}

export default LLMSelectOrButton
