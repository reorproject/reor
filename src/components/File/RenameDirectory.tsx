import React, { useEffect, useState } from 'react'

import { Button } from '@material-tailwind/react'
import { toast } from 'react-toastify'

import ReorModal from '../Common/Modal'

import { getInvalidCharacterInFileName } from '@/utils/strings'
import { useFileContext } from '@/contexts/FileContext'

const RenameDirModal: React.FC = () => {
  const { fileDirToBeRenamed, setFileDirToBeRenamed, renameFile } = useFileContext()
  const [isUpdatingDirName, setIsUpdatingDirName] = useState<boolean>(false)

  const [dirPrefix, setDirPrefix] = useState<string>('')
  const [dirName, setDirName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const setDirectoryUponNoteChange = async () => {
      const initialDirPathPrefix = await window.path.dirname(fileDirToBeRenamed)
      setDirPrefix(initialDirPathPrefix)
      const trimmedInitialDirName = await window.path.basename(fileDirToBeRenamed)
      setDirName(trimmedInitialDirName)
    }

    setDirectoryUponNoteChange()
  }, [fileDirToBeRenamed])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setDirName(newName)

    getInvalidCharacterInFileName(newName).then((invalidCharacter) => {
      if (invalidCharacter) {
        setErrorMessage(`The character [${invalidCharacter}] cannot be included in directory name.`)
      } else {
        setErrorMessage(null)
      }
    })
  }

  const onClose = () => {
    setFileDirToBeRenamed('')
  }

  const sendDirRename = async () => {
    if (errorMessage) {
      return
    }
    if (!dirName) {
      toast.error('Directory name cannot be empty', {
        className: 'mt-5',
        closeOnClick: false,
        draggable: false,
      })
      return
    }
    setIsUpdatingDirName(true)
    // get full path of new directory

    // await renameDir({
    //   path: `${fileDirToBeRenamed}`,
    //   newDirName: `${dirPrefix}${dirName}`,
    // })
    await renameFile(fileDirToBeRenamed, `${dirPrefix}${dirName}`)
    onClose()
    setIsUpdatingDirName(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isUpdatingDirName) {
      sendDirRename()
    }
  }

  return (
    <ReorModal isOpen={!!fileDirToBeRenamed} onClose={onClose}>
      <div className="my-2 ml-3 mr-6 h-full min-w-[400px]">
        <h2 className="mb-3 text-xl font-semibold text-white">Rename Directory</h2>
        <input
          type="text"
          className=" block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={dirName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="New directory Name"
        />
        <div className="flex items-center gap-3">
          <Button
            className="mb-2 mt-3 h-10 w-[80px] cursor-pointer border-none bg-blue-600 px-2 py-0 text-center hover:bg-blue-600"
            onClick={sendDirRename}
            placeholder=""
            disabled={isUpdatingDirName}
          >
            Rename
          </Button>
          {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
        </div>
      </div>
    </ReorModal>
  )
}

export default RenameDirModal
