import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SettingsModal, { SettingsTab } from '../Settings'

interface LLMSelectOrButtonProps {
  llmConfigs: Array<{ modelName: string }>
  selectedLLM: string
  setSelectedLLM: (value: string) => void
}

const LLMSelectOrButton: React.FC<LLMSelectOrButtonProps> = ({ llmConfigs, selectedLLM, setSelectedLLM }) => {
  
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
      {llmConfigs.length === 0 ? (
        <Button className="bg-transparent text-primary hover:bg-slate-700" onClick={openLLMSettings}>
          Attach LLM
        </Button>
      ) : (
        <Select value={selectedLLM} onValueChange={(value) => handleLLMChange(value)}>
          <SelectTrigger className="w-32 border border-solid border-muted-foreground">
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
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeModal} initialTab={activeTab} />
    </div>
  )
}

export default LLMSelectOrButton
