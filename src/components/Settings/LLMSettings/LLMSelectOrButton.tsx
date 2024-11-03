import React, { useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SettingsModal, { SettingsTab } from '../Settings'
import useLLMConfigs from '@/lib/hooks/use-llm-configs'

interface LLMSelectOrButtonProps {
  selectedLLM: string | undefined
  setSelectedLLM: (value: string | undefined) => void
}

const LLMSelectOrButton: React.FC<LLMSelectOrButtonProps> = ({ selectedLLM, setSelectedLLM }) => {
  const { llmConfigs, fetchAndUpdateModelConfigs } = useLLMConfigs()
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
        <FiRefreshCw onClick={fetchAndUpdateModelConfigs} className="ml-1 cursor-pointer text-xs text-gray-400" />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={closeModal} initialTab={activeTab} />
      </div>
    </div>
  )
}

export default LLMSelectOrButton
