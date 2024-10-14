import React, { useState } from 'react'
import { EmbeddingModelWithRepo } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveModelConfigToElectronStore()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
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
            onChange={(e) => setHuggingfaceRepo(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Xenova/bge-base-en-v1.5"
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
          <Button onClick={saveModelConfigToElectronStore}>Attach</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewRemoteEmbeddingModelModal
