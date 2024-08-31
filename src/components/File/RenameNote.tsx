import React, { useEffect, useState } from 'react'

import { Button } from '@material-tailwind/react'
import { toast } from 'react-toastify'

import ReorModal from '../Common/Modal'

import { getInvalidCharacterInFileName, removeFileExtension } from '@/utils/strings'
import { useFileContext } from '@/providers/FileContext'

const RenameNoteModal: React.FC = () => {
  const { noteToBeRenamed, setNoteToBeRenamed, renameFile } = useFileContext()

  const fileExtension = noteToBeRenamed.split('.').pop() || 'md'
  const [dirPrefix, setDirPrefix] = useState<string>('')
  const [noteName, setNoteName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const setDirectoryUponNoteChange = async () => {
      const initialNotePathPrefix = await window.path.dirname(noteToBeRenamed)
      setDirPrefix(initialNotePathPrefix)
      const initialNoteName = await window.path.basename(noteToBeRenamed)
      const trimmedInitialNoteName = removeFileExtension(initialNoteName) || ''
      setNoteName(trimmedInitialNoteName)
    }

    setDirectoryUponNoteChange()
  }, [noteToBeRenamed])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setNoteName(newName)

    getInvalidCharacterInFileName(newName).then((invalidCharacter) => {
      if (invalidCharacter) {
        setErrorMessage(`The character [${invalidCharacter}] cannot be included in note name.`)
      } else {
        setErrorMessage(null)
      }
    })
  }
  const onClose = () => {
    setNoteToBeRenamed('')
  }

  const sendNoteRename = async () => {
    if (errorMessage) {
      return
    }
    if (!noteName) {
      toast.error('Note name cannot be empty', {
        className: 'mt-5',
        closeOnClick: false,
        draggable: false,
      })
      return
    }

    await renameFile(noteToBeRenamed, `${dirPrefix}${noteName}.${fileExtension}`)
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendNoteRename()
    }
  }

  return (
    <ReorModal isOpen={!!noteToBeRenamed} onClose={onClose}>
      <div className="my-2 ml-3 mr-6 h-full min-w-[400px]">
        <h2 className="mb-3 text-xl font-semibold text-white">Rename Note</h2>
        <input
          type="text"
          className=" block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={noteName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="New Note Name"
        />
        <div className="flex items-center gap-3">
          <Button
            className="mb-2 mt-3 h-10 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={sendNoteRename}
            placeholder=""
          >
            Rename
          </Button>
          {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
        </div>
      </div>
    </ReorModal>
  )
}

export default RenameNoteModal
