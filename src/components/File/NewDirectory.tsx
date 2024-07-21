import React, { useEffect, useState } from 'react'

import { Button } from '@material-tailwind/react'
import posthog from 'posthog-js'
import { toast } from 'react-toastify'

import ReorModal from '../Common/Modal'

import errorToStringRendererProcess from '@/utils/error'
import { getInvalidCharacterInFilePath } from '@/utils/strings'

interface NewDirectoryComponentProps {
  isOpen: boolean
  onClose: () => void
  onDirectoryCreate: string
}

const NewDirectoryComponent: React.FC<NewDirectoryComponentProps> = ({ isOpen, onClose, onDirectoryCreate }) => {
  const [directoryName, setDirectoryName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setDirectoryName('')
      setErrorMessage(null)
    }
  }, [isOpen])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setDirectoryName(newName)

    getInvalidCharacterInFilePath(newName).then((invalidCharacter) => {
      if (invalidCharacter) {
        setErrorMessage(`The character [${invalidCharacter}] cannot be included in directory name.`)
      } else {
        setErrorMessage(null)
      }
    })
  }

  const sendNewDirectoryMsg = async () => {
    try {
      if (!directoryName || errorMessage) {
        return
      }
      const normalizedDirectoryName = directoryName.replace(/\\/g, '/')
      const basePath = onDirectoryCreate || (await window.electronStore.getVaultDirectoryForWindow())
      const fullPath = await window.path.join(basePath, normalizedDirectoryName)

      posthog.capture('created_new_directory_from_new_directory_modal')
      window.fileSystem.createDirectory(fullPath)
      onClose()
    } catch (e) {
      toast.error(errorToStringRendererProcess(e), {
        className: 'mt-5',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendNewDirectoryMsg()
    }
  }

  return (
    <ReorModal isOpen={isOpen} onClose={onClose} widthType="newDirectory">
      <div className="my-2 ml-3 mr-6 h-full min-w-[400px]">
        <h2 className="mb-3 text-xl font-semibold text-white">New Directory</h2>
        <input
          type="text"
          className=" block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={directoryName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="Directory Name"
        />
        <Button
          className="mb-2 mt-3 h-10 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
          onClick={sendNewDirectoryMsg}
          placeholder=""
        >
          Create
        </Button>
        {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
      </div>
    </ReorModal>
  )
}

export default NewDirectoryComponent
