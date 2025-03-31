import React, { useState } from 'react'
import { EmbeddingModelWithRepo } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'
import { Input } from 'tamagui'
import { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from '@/components/ui/dialog'
import ExternalLink from '../../../Common/ExternalLink'

interface NewRemoteEmbeddingModelModalProps {
  isOpen: boolean
  onClose: () => void
  handleUserHasChangedModel?: () => void
}

const NewRemoteEmbeddingModelModal: React.FC<NewRemoteEmbeddingModelModalProps> = ({
  isOpen,
  onClose,
  handleUserHasChangedModel,
}) => {
  const [huggingfaceRepo, setHuggingfaceRepo] = useState('')

  const saveModelConfigToElectronStore = async () => {
    if (!huggingfaceRepo) {
      onClose()
      return
    }

    const modelObject: EmbeddingModelWithRepo = {
      type: 'repo',
      repoName: huggingfaceRepo,
    }

    await window.electronStore.addNewRepoEmbeddingModel(modelObject)
    posthog.capture('save_repo_embedding_model', {
      modelRepo: huggingfaceRepo,
    })
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel()
    }
    onClose()
  }

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      saveModelConfigToElectronStore()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay>
        <DialogContent className="p-4 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Custom embedding model</DialogTitle>
            <DialogDescription>
              If you don&apos;t want to use one of our default embedding models, you can choose a Hugging Face model and
              attach it here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={huggingfaceRepo}
              onChangeText={setHuggingfaceRepo}
              onKeyPress={handleKeyPress}
              placeholder="Xenova/bge-base-en-v1.5"
              size="$1"
              py="$3"
              px="$2"
            />
            <p className="text-xs italic text-muted-foreground">
              <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
                This page on Hugging Face
              </ExternalLink>{' '}
              has models that are compatible with Reor. It must be a &quot;Xenova&quot; ONNX embedding model. Check out{' '}
              <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">our guide</ExternalLink> for
              more info.
            </p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={saveModelConfigToElectronStore}>
              Attach
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}

export default NewRemoteEmbeddingModelModal
