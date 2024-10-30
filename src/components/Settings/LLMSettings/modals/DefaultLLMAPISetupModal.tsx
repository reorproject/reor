import React, { useState } from 'react'
import posthog from 'posthog-js'
import { APIInterface, LLMAPIConfig } from 'electron/main/electron-store/storeConfig'
import {
  anthropicDefaultAPIName,
  anthropicDefaultLLMs,
  openAIDefaultAPIName,
  openAIDefaultLLMs,
} from '@shared/defaultLLMs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export interface CloudLLMSetupModalProps {
  isOpen: boolean
  onClose: () => void
  apiInterface: APIInterface
}

const DefaultLLMAPISetupModal: React.FC<CloudLLMSetupModalProps> = ({ isOpen, onClose, apiInterface }) => {
  const [apiKey, setAPIKey] = useState('')

  const LLMDisplayName = apiInterface === 'openai' ? 'OpenAI' : 'Anthropic'

  const handleSave = async () => {
    if (apiKey) {
      posthog.capture('save_cloud_llm', {
        provider: apiInterface,
      })

      if (apiInterface === 'openai') {
        const api: LLMAPIConfig = {
          apiKey,
          apiInterface: 'openai',
          name: openAIDefaultAPIName,
        }
        await window.llm.addOrUpdateLLMAPIConfig(api)
        openAIDefaultLLMs.forEach(async (model) => {
          await window.llm.addOrUpdateLLMConfig(model)
        })
      } else if (apiInterface === 'anthropic') {
        const api: LLMAPIConfig = {
          apiKey,
          apiInterface: 'anthropic',
          name: anthropicDefaultAPIName,
        }
        await window.llm.addOrUpdateLLMAPIConfig(api)
        anthropicDefaultLLMs.forEach(async (model) => {
          await window.llm.addOrUpdateLLMConfig(model)
        })
      }
    }
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{LLMDisplayName} Setup</DialogTitle>
          <DialogDescription>Enter your {LLMDisplayName} API key below:</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setAPIKey(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`${LLMDisplayName} API Key`}
          />
          <p className="mt-0 text-xs text-muted-foreground">
            <i>You&apos;ll then be able to choose an {LLMDisplayName} model in the model dropdown...</i>
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DefaultLLMAPISetupModal
