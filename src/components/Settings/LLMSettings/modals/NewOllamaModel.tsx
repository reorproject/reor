import React, { useState, useEffect } from 'react'
import { ProgressResponse } from 'ollama'
import posthog from 'posthog-js'
import { toast } from 'react-toastify'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
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
import ExternalLink from '@/components/Common/ExternalLink'
import errorToStringRendererProcess from '@/lib/error'
import { Progress } from '@/components/ui/progress'

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
  const [modelNameError, setModelNameError] = useState('')
  const [downloadProgress, setDownloadProgress] = useState<{
    [modelName: string]: ModelDownloadStatus
  }>({})
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadSelectedModel = async () => {
    if (!modelNameBeingInputted) {
      setModelNameError('Please enter a model name')
      return
    }
    let taggedModelName = modelNameBeingInputted
    if (!taggedModelName.includes(':')) {
      taggedModelName = `${taggedModelName}:latest`
    }
    setIsDownloading(true)
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
    } finally {
      setIsDownloading(false)
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

  const calculateProgress = (progress: ProgressResponse) => {
    if (progress.total && progress.completed) {
      return Math.round((progress.completed / progress.total) * 100)
    }
    return 0
  }

  const renderProgressBar = (modelName: string, { progress, error }: ModelDownloadStatus) => {
    const progressPercentage = calculateProgress(progress)

    if (error) {
      return (
        <div className="flex items-center space-x-2 text-destructive">
          <XCircle size={16} />
          <span className="text-sm">{`Error: ${error}`}</span>
        </div>
      )
    }

    if (progress.status === 'success') {
      return (
        <div className="flex items-center space-x-2 text-green-500">
          <CheckCircle size={16} />
          <span className="text-sm">Download complete! Refresh the chat window to use the new model.</span>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>{modelName}</span>
          <span>{`${progressPercentage}%`}</span>
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>New Local LLM</DialogTitle>
          <DialogDescription>
            Reor will automatically download an LLM. Please choose an LLM from the{' '}
            <ExternalLink href="https://ollama.com/library">Ollama Library</ExternalLink> and paste the name of the LLM
            below:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="text"
            value={modelNameBeingInputted}
            onChange={(e) => {
              setModelNameBeingInputted(e.target.value)
              setModelNameError('')
            }}
            placeholder="llama3.2"
          />
          <p className="m-0 text-xs italic text-muted-foreground">
            We recommend either nemotron-mini, llama3.2, or qwen2.5.
          </p>
          {modelNameError && <p className="text-xs text-destructive">{modelNameError}</p>}
          {Object.entries(downloadProgress).map(([modelName, status]) => (
            <div key={modelName} className="m-0">
              {renderProgressBar(modelName, status)}
            </div>
          ))}
          {Object.entries(downloadProgress).length > 0 && (
            <p className="m-0 text-xs text-muted-foreground">
              (Feel free to close this modal while the download completes)
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={downloadSelectedModel} disabled={isDownloading}>
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Downloading...
              </>
            ) : (
              'Download'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NewOllamaModelModal
