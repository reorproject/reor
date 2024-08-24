import React, { useState, useEffect } from 'react'

import { Button } from '@material-tailwind/react'
import { ProgressResponse } from 'ollama'
import posthog from 'posthog-js'
import { toast } from 'react-toastify'

import ExternalLink from '@/components/Common/ExternalLink'
import ReorModal from '@/components/Common/Modal'
import errorToStringRendererProcess from '@/utils/error'
import downloadPercentage from './utils'

interface NewOllamaModelModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ModelDownloadStatus {
  progress: ProgressResponse
  error?: string // Optional error message
}

const NewOllamaModelModal: React.FC<NewOllamaModelModalProps> = ({ isOpen, onClose }) => {
  // const [newModelPath, setNewModelPath] = useState<string>("");
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
      //
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
      toast.error(`${taggedModelName} download failed: ${errorMessage}`)
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
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="mx-2 mb-2 w-[400px] pl-3">
        <h2 className="mb-0  font-semibold text-white">New Local LLM</h2>
        <p className="mb-6 mt-1 text-xs text-white">
          Reor will automaticaly download an LLM. Please choose an LLM from the{' '}
          <ExternalLink href="https://ollama.com/library">Ollama Library</ExternalLink> and paste the name of the LLM
          below:
        </p>

        <input
          type="text"
          className=" mt-1 box-border block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={modelNameBeingInputted}
          onChange={(e) => setModelNameBeingInputted(e.target.value)}
          placeholder="mistral"
        />
        <p className="my-2 text-xs italic text-white"> We recommended either mistral, llama3, or phi3.</p>

        <div className="flex justify-end pb-2">
          <Button
            className="mt-3 h-8 w-[100px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={downloadSelectedModel}
            placeholder=""
          >
            Download
          </Button>
        </div>
        {modelNameerror && <p className="break-words text-xs text-red-500">{modelNameerror}</p>}
        <div>
          {Object.entries(downloadProgress).map(([modelName, { progress, error }]) => (
            <div key={modelName} className="mb-4">
              {(() => {
                if (error) {
                  return <p className="break-words text-sm text-red-500">{`${modelName}: Error - ${error}`}</p>
                }
                if (progress.status === 'success') {
                  return (
                    <p className="text-sm text-white">
                      {`${modelName}: Download complete! Refresh the chat window to use the new model.`}
                    </p>
                  )
                }
                return (
                  <p className="text-sm text-white">
                    {`${modelName}: Download progress - ${downloadPercentage(progress)}`}
                  </p>
                )
              })()}
            </div>
          ))}
          {Object.entries(downloadProgress).length > 0 && (
            <p className="text-xs text-white">(Feel free to close this modal while the download completes)</p>
          )}
        </div>
      </div>
    </ReorModal>
  )
}

export default NewOllamaModelModal
