import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { PromptTemplate } from '../utils/types'
import { Textarea } from '@/components/ui/textarea'

const PromptEditor: React.FC<{
  promptTemplate: PromptTemplate
  onSave: (newPromptTemplate: PromptTemplate) => void
}> = ({ promptTemplate, onSave }) => {
  const [editedSystemPrompt, setEditedSystemPrompt] = useState<string>(
    promptTemplate.find((prompt) => prompt.role === 'system')?.content || '',
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((newSystemPrompt: string) => {
      const updatedPromptTemplate = promptTemplate.map((prompt) =>
        prompt.role === 'system' ? { ...prompt, content: newSystemPrompt } : prompt,
      )
      onSave(updatedPromptTemplate)
    }, 500),
    [onSave, promptTemplate],
  )

  useEffect(() => {
    debouncedSave(editedSystemPrompt)
  }, [editedSystemPrompt, debouncedSave])

  const updateSystemPrompt = (newContent: string) => {
    setEditedSystemPrompt(newContent)
  }

  return (
    <div className="w-full  text-foreground">
      <h3 className="text-foreground">Edit System Prompt</h3>
      <p className="text-muted-foreground">Customize the system prompt for your AI assistant.</p>
      <div className="grid gap-6 py-4">
        <div className="flex items-start gap-4">
          <Textarea
            id="system-prompt"
            value={editedSystemPrompt}
            onChange={(e) => updateSystemPrompt(e.target.value)}
            className="h-64 w-[32rem] flex-1 border border-solid border-input bg-background text-sm text-muted-foreground"
          />
        </div>
      </div>
    </div>
  )
}

export default PromptEditor
