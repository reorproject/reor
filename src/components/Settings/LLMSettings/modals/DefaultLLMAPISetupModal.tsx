import React, { useState } from 'react'
import { APIInterface, LLMAPIConfig } from 'electron/main/electron-store/storeConfig'
import {
  anthropicDefaultAPIName,
  anthropicDefaultLLMs,
  openAIDefaultAPIName,
  openAIDefaultLLMs,
} from '@shared/defaultLLMs'
import { Input } from 'tamagui'
import { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
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

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay>
        <DialogContent className="p-4 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{LLMDisplayName} Setup</DialogTitle>
            <DialogDescription>Enter your {LLMDisplayName} API key below:</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 pt-4">
            <Input
              value={apiKey}
              onChangeText={setAPIKey}
              onKeyPress={handleKeyPress}
              placeholder={`${LLMDisplayName} API Key`}
              size="$1"
              py="$3"
              px="$2"
              secureTextEntry
            />
            <p className="mt-0 text-xs text-muted-foreground">
              <i>You&apos;ll then be able to choose an {LLMDisplayName} model in the model dropdown...</i>
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}

export default DefaultLLMAPISetupModal
