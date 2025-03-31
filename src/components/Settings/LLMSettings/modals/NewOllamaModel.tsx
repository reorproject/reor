import React, { useState, useEffect } from 'react'
import { ProgressResponse } from 'ollama'
import posthog from 'posthog-js'
import { toast } from 'react-toastify'
import { Input } from 'tamagui'
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
import ExternalLink from '@/components/Common/ExternalLink'
import errorToStringRendererProcess from '@/lib/error'
import downloadPercentage from './utils'

interface NewOllamaModelModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ModelDownloadStatus {
  progress: ProgressResponse
  error?: string
}

const NewOllamaModelModal: React.FC<NewOllamaModelModalProps> = ({ isOpen, onClose }) => {
  const [modelNameBeingInputted, setModelNameBeingInputted] = useState('')
  const [modelNameerror, setModelNameError] = useState('')
  const [downloadProgress, setDownloadProgress] = useState<{
    [modelName: string]: ModelDownloadStatus
  }>({})

  const downloadSelectedModel = async () => {
    if (!modelNameBeingInputted) {
      setModelNameError('Please enter a model name')
      return
    }
    let taggedModelName = modelNameBeingInputted
    if (!taggedModelName.includes(':')) {
      taggedModelName = `${taggedModelName}:latest`
    }
    try {
      posthog.capture('download_new_llm', {
        modelName: taggedModelName,
      })
      await window.llm.pullOllamaModel(taggedModelName)
      await window.llm.setDefaultLLM(taggedModelName)
      toast.success(`${taggedModelName} download complete!`)
    } catch (e) {
      const errorMessage = errorToStringRendererProcess(e)
      setDownloadProgress((prevProgress) => ({
        ...prevProgress,
        [taggedModelName]: {
          ...prevProgress[taggedModelName],
          error: errorMessage,
        },
      }))
      throw e
    }
  }

  useEffect(() => {
    const updateStream = (modelName: string, progress: ProgressResponse) => {
      setDownloadProgress((prevProgress) => ({
        ...prevProgress,
        [modelName]: {
          ...prevProgress[modelName],
          progress,
        },
      }))
    }

    const removeOllamaDownloadProgressListener = window.ipcRenderer.receive('ollamaDownloadProgress', updateStream)

    return () => {
      removeOllamaDownloadProgressListener()
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay>
        <DialogContent className="p-4 sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>New Local LLM</DialogTitle>
            <DialogDescription>
              Reor will automatically download an LLM. Please choose an LLM from the{' '}
              <ExternalLink href="https://ollama.com/library">Ollama Library</ExternalLink> and paste the name of the
              LLM below:
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              value={modelNameBeingInputted}
              onChangeText={setModelNameBeingInputted}
              placeholder="llama3.2"
              size="$1"
              py="$3"
              px="$2"
            />
            <p className="text-xs italic text-muted-foreground">
              We recommended either nemotron-mini, llama3.2, or qwen2.5.
            </p>
            {modelNameerror && <p className="text-xs text-destructive">{modelNameerror}</p>}
            {Object.entries(downloadProgress).map(([modelName, { progress, error }]) => (
              <div key={modelName}>
                {(() => {
                  if (error) {
                    return <p className="text-sm text-destructive">{`${modelName}: Error - ${error}`}</p>
                  }
                  if (progress.status === 'success') {
                    return (
                      <p className="text-sm text-muted-foreground">
                        {`${modelName}: Download complete! Refresh the chat window to use the new model.`}
                      </p>
                    )
                  }
                  return (
                    <p className="text-sm text-muted-foreground">
                      {`${modelName}: Download progress - ${downloadPercentage(progress)}`}
                    </p>
                  )
                })()}
              </div>
            ))}
            {Object.entries(downloadProgress).length > 0 && (
              <p className="text-xs text-muted-foreground">
                (Feel free to close this modal while the download completes)
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={downloadSelectedModel}>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  )
}

export default NewOllamaModelModal
