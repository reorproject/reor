import React from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface LLMSelectOrButtonProps {
  llmConfigs: Array<{ modelName: string }>
  selectedLLM: string
  handleLLMChange: (value: string) => void
  openLLMSettings: () => void
}

const LLMSelectOrButton: React.FC<LLMSelectOrButtonProps> = ({
  llmConfigs,
  selectedLLM,
  handleLLMChange,
  openLLMSettings
}) => {
  return llmConfigs.length === 0 ? (
    <Button className="bg-transparent text-primary hover:bg-slate-700" onClick={openLLMSettings}>
      Attach LLM
    </Button>
  ) : (
    <Select value={selectedLLM} onValueChange={handleLLMChange}>
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
  )
}

export default LLMSelectOrButton
