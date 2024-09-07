import React, { useEffect, useState } from 'react'

import { Button } from '@material-tailwind/react'
import posthog from 'posthog-js'

import ReorModal from '../Common/Modal'
import { getInvalidCharacterInFileName } from '@/utils/strings'
import { useFileContext } from '@/contexts/FileContext'
import { useTabsContext } from '@/contexts/TabContext'

interface NewNoteComponentProps {
  isOpen: boolean
  onClose: () => void
}

const NewNoteComponent: React.FC<NewNoteComponentProps> = ({ isOpen, onClose }) => {
  const { openTabContent } = useTabsContext()
  const [fileName, setFileName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { currentlyOpenFilePath } = useFileContext()

  useEffect(() => {
    if (!isOpen) {
      setFileName('')
      setErrorMessage(null)
    }
  }, [isOpen])

  const handleValidName = async (name: string) => {
    const invalidCharacters = await getInvalidCharacterInFileName(name)
    if (invalidCharacters) {
      setErrorMessage(`Cannot put ${invalidCharacters} in file name`)
      throw new Error(`Cannot put ${invalidCharacters} in file name`)
    }
    setErrorMessage(null)
  }

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    await handleValidName(newName)
    setFileName(newName)
  }

  const sendNewNoteMsg = async () => {
    await handleValidName(fileName)
    if (!fileName || errorMessage) return

    let finalPath = fileName
    if (currentlyOpenFilePath !== '' && currentlyOpenFilePath !== null) {
      const directoryName = await window.path.dirname(currentlyOpenFilePath)
      finalPath = await window.path.join(directoryName, fileName)
    }
    const basename = await window.path.basename(finalPath)
    openTabContent(finalPath, `# ${basename}\n`)
    posthog.capture('created_new_note_from_new_note_modal')
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendNewNoteMsg()
    }
  }

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="my-2 ml-3 mr-6 h-full min-w-[400px]">
        <h2 className="mb-3 text-xl font-semibold text-white">New Note</h2>
        <input
          type="text"
          className=" block w-full rounded-md border border-gray-300 px-3 py-2 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
          value={fileName}
          onChange={handleNameChange}
          onKeyDown={handleKeyPress}
          placeholder="Note Name"
        />

        <div className="flex items-center gap-3">
          <Button
            className="mb-2 mt-3 h-10 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={sendNewNoteMsg}
            placeholder=""
          >
            Create
          </Button>
          {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
        </div>
      </div>
    </ReorModal>
  )
}

export default NewNoteComponent
