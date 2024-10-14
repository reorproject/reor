import React, { useEffect, useState } from 'react'
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

  useEffect(() => {
    console.log('isopen: ', isOpen)
  }, [isOpen])

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
          <DialogTitle>Set up remote model</DialogTitle>
          <DialogDescription>
            Provide the repo name from Hugging Face like &quot;Xenova/bge-base-en-v1.5&quot;.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={huggingfaceRepo}
            onChange={(e) => setHuggingfaceRepo(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Embedding Model Repo"
          />
          <p className="text-xs italic text-muted-foreground">
            <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
              This page on Hugging Face
            </ExternalLink>{' '}
            has models that are compatible with Reor. It must be a &quot;Xenova&quot; ONNX embedding model. Check out{' '}
            <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">this guide</ExternalLink> for
            more info.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={saveModelConfigToElectronStore}>Attach Remote</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewRemoteEmbeddingModelModal
