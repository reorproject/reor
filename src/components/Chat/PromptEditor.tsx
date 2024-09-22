import React, { useState } from 'react'
import { PromptTemplate } from './types'
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const PromptEditor: React.FC<{
  promptTemplate: PromptTemplate
  onSave: (newPromptTemplate: PromptTemplate) => void
}> = ({ promptTemplate, onSave }) => {
  const [editedPrompt, setEditedPrompt] = useState<PromptTemplate>(promptTemplate)

  const handleSave = () => {
    onSave(editedPrompt)
  }

  return (
    <DialogContent className="bg-background text-foreground sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="text-foreground">Edit Prompt Template</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Customize the prompt template for your AI assistant. Click done when you&apos;re done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {editedPrompt.map((prompt, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index} className="grid gap-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`role-${index}`} className="text-right text-foreground">
                Role
              </Label>
              <Select
                value={prompt.role}
                onValueChange={(value) =>
                  setEditedPrompt(
                    editedPrompt.map((p, i) => (i === index ? { ...p, role: value as 'system' | 'user' } : p)),
                  )
                }
              >
                <SelectTrigger className="col-span-3 border-input bg-background text-foreground">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="border-input bg-background text-foreground">
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`content-${index}`} className="text-right text-foreground">
                Content
              </Label>
              <Textarea
                id={`content-${index}`}
                value={prompt.content}
                onChange={(e) =>
                  setEditedPrompt(editedPrompt.map((p, i) => (i === index ? { ...p, content: e.target.value } : p)))
                }
                className="col-span-3 border-input bg-background text-foreground"
              />
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button type="submit" onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Done
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default PromptEditor
