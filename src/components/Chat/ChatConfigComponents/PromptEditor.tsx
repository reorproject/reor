import React, { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { PromptTemplate } from '../types'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const PromptEditor: React.FC<{
  promptTemplate: PromptTemplate
  onSave: (newPromptTemplate: PromptTemplate) => void
}> = ({ promptTemplate, onSave }) => {
  const [editedPrompt, setEditedPrompt] = useState<PromptTemplate>(promptTemplate)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce((newPromptTemplate: PromptTemplate) => {
      onSave(newPromptTemplate)
    }, 500),
    [onSave],
  )

  useEffect(() => {
    debouncedSave(editedPrompt)
  }, [editedPrompt, debouncedSave])

  const updateRole = (index: number, newRole: 'system' | 'user') => {
    setEditedPrompt((prevPrompt) => {
      const updatedPrompt = [...prevPrompt]
      updatedPrompt[index] = { ...updatedPrompt[index], role: newRole }
      return updatedPrompt
    })
  }

  const updateContent = (index: number, newContent: string) => {
    setEditedPrompt((prevPrompt) => {
      const updatedPrompt = [...prevPrompt]
      updatedPrompt[index] = { ...updatedPrompt[index], content: newContent }
      return updatedPrompt
    })
  }

  return (
    <div className="w-full max-w-4xl bg-background text-foreground">
      <h3 className="text-foreground">Edit Prompt Template</h3>
      <p className="text-muted-foreground">
        Customize the prompt template for your AI assistant. Use the variables {`{QUERY}`} and {`{CONTEXT}`} to
        reference the user&apos;s query and the context searched (if you toggle the &quot;make initial search&quot;
        option in settings).
      </p>
      <div className="grid gap-6 py-4">
        {editedPrompt.map((prompt, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="grid gap-2">
            <div className="flex items-center gap-4">
              <Label htmlFor={`role-${index}`} className="w-20 text-foreground">
                Role
              </Label>
              <Select value={prompt.role} onValueChange={(value: 'system' | 'user') => updateRole(index, value)}>
                <SelectTrigger className="w-full border-input bg-background text-foreground">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-input bg-background text-foreground">
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start gap-4">
              <Label htmlFor={`content-${index}`} className="w-20 pt-2 text-foreground">
                Content
              </Label>
              <Textarea
                id={`content-${index}`}
                value={prompt.content}
                onChange={(e) => updateContent(index, e.target.value)}
                className="h-64 flex-1 border border-solid border-input bg-background text-sm text-muted-foreground"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PromptEditor
