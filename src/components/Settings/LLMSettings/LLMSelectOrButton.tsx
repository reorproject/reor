import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SettingsModal, { SettingsTab } from '../Settings'
import useLLMConfigs from '@/lib/hooks/use-llm-configs'
import { useThemeManager } from '@/contexts/ThemeContext'

interface LLMSelectOrButtonProps {
  selectedLLM: string | undefined
  setSelectedLLM: (value: string | undefined) => void
}

const LLMSelectOrButton: React.FC<LLMSelectOrButtonProps> = ({ selectedLLM, setSelectedLLM }) => {
  const { llmConfigs } = useLLMConfigs()
  const { state } = useThemeManager()
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
            <SelectTrigger
              className={`h-7 w-32 border-0 text-[10px] ${state === 'light' ? 'text-black' : 'text-white'}focus:ring-0 focus:ring-offset-0`}
            >
              <SelectValue placeholder="Select LLM" />
            </SelectTrigger>
            <SelectContent className="rounded-md border border-dark-gray-c-eight bg-[#1c1c1c]">
              {llmConfigs.map((llm) => (
                <SelectItem
                  key={llm.modelName}
                  value={llm.modelName}
                  className="cursor-pointer text-[10px] text-gray-300 hover:bg-[#252525] focus:bg-[#252525] focus:text-gray-200"
                >
                  {llm.modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <SettingsModal isOpen={isSettingsModalOpen} onClose={closeModal} initialTab={activeTab} />
      </div>
    </div>
  )
}

export default LLMSelectOrButton
