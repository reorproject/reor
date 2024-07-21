import React, { useMemo, useState } from 'react'

import { Button } from '@material-tailwind/react'
import { EmbeddingModelWithLocalPath } from 'electron/main/electron-store/storeConfig'
import posthog from 'posthog-js'
import { IconContext } from 'react-icons'
import { CiFileOn } from 'react-icons/ci'
import { FaUpload, FaRegTrashAlt } from 'react-icons/fa'

import ExternalLink from '../../../Common/ExternalLink'
import ReorModal from '../../../Common/Modal'

interface NewLocalEmbeddingModelModalProps {
  isOpen: boolean
  onClose: () => void
  handleUserHasChangedModel?: () => void
}

const NewLocalEmbeddingModelModal: React.FC<NewLocalEmbeddingModelModalProps> = ({
  isOpen,
  onClose,
  handleUserHasChangedModel,
}) => {
  const [newModelPath, setNewModelPath] = useState<string>('')

  const handleModelDirectorySelection = async () => {
    const paths = await window.fileSystem.openDirectoryDialog()
    if (paths && paths.length > 0) {
      setNewModelPath(paths[0])
    }
  }
  const saveModelConfigToElectronStore = async () => {
    if (!newModelPath) {
      onClose()
      return
    }

    const modelObject: EmbeddingModelWithLocalPath = {
      type: 'local',
      localPath: newModelPath,
    }

    await window.electronStore.addNewLocalEmbeddingModel(modelObject)
    posthog.capture('save_local_embedding_model', {
      modelPath: newModelPath,
    })
    if (handleUserHasChangedModel) {
      handleUserHasChangedModel()
    }
    onClose()
  }

  const handleSelectionDelete = () => {
    setNewModelPath('')
  }

  const whiteIconContextValue: { color: string } = useMemo(() => ({ color: 'white' }), [])
  const salmonIconContextValue: { color: string } = useMemo(() => ({ color: 'salmon' }), [])
  return (
    <ReorModal isOpen={isOpen} onClose={saveModelConfigToElectronStore} widthType="newEmbeddingModel">
      <div className="mx-2 mb-2 w-[400px] pl-3">
        <h3 className="mb-0 font-semibold text-white">Upload and attach local model</h3>
        <p className="mb-6 mt-2 text-xs text-white">Download a ONNX embedding model and select its directory below:</p>

        <Button
          className="my-1 flex h-[164px] w-full cursor-pointer flex-col items-center justify-center border-dotted bg-dark-gray-c-one px-2 py-0 text-center hover:bg-dark-gray-c-two"
          onClick={handleModelDirectorySelection}
          placeholder=""
        >
          <div className=" rounded-full border-2 border-solid p-3">
            <FaUpload size={20} />
          </div>
          <p className="font-bold text-blue-200">Click to Upload</p>
        </Button>
        <p className="my-4 text-xs italic text-white">
          <ExternalLink href="https://huggingface.co/models?pipeline_tag=feature-extraction&sort=downloads&search=xenova">
            This page on Hugging Face{' '}
          </ExternalLink>
          has most available models. It must be a &quot;Xenova&quot; ONNX embedding model. Check out{' '}
          <ExternalLink href="https://www.reorproject.org/docs/documentation/embedding">this guide</ExternalLink> for
          more info.{' '}
        </p>
        {newModelPath && (
          <div className="flex w-full items-center rounded-lg border-solid border-dark-gray-c-one p-1">
            <IconContext.Provider value={salmonIconContextValue}>
              <CiFileOn size={30} className="mx-3" />
            </IconContext.Provider>

            <p className="mt-2 text-xs text-gray-100">
              Selected: <strong>{newModelPath}</strong>
            </p>
            <IconContext.Provider value={whiteIconContextValue}>
              <FaRegTrashAlt size={20} className="mr-4 hover:cursor-pointer" onClick={handleSelectionDelete} />
            </IconContext.Provider>
          </div>
        )}
        <div className="flex justify-between gap-3 pb-2">
          <Button
            className="mt-3 h-8 w-full cursor-pointer rounded border-2 border-blue-300 bg-transparent px-2 py-0 text-center hover:bg-blue-600"
            onClick={onClose}
            placeholder=""
          >
            Discard
          </Button>
          <Button
            className="mt-3 h-8 w-full cursor-pointer rounded border-2 border-blue-800 bg-blue-600 px-2 py-0 text-center hover:bg-transparent"
            onClick={saveModelConfigToElectronStore}
            placeholder=""
          >
            Attach files
          </Button>
        </div>
      </div>
    </ReorModal>
  )
}

export default NewLocalEmbeddingModelModal
