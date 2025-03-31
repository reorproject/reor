import React, { useEffect, useState } from 'react'

import { Button } from '@material-tailwind/react'
import posthog from 'posthog-js'

import { Input, H3 } from 'tamagui'
import { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'
import ReorModal from '../Common/Modal'
import { getInvalidCharacterInFilePath } from '@/lib/file'
import { useFileContext } from '@/contexts/FileContext'

interface NewDirectoryComponentProps {
  isOpen: boolean
  onClose: () => void
  parentDirectoryPath?: string
}

const NewDirectoryComponent: React.FC<NewDirectoryComponentProps> = ({ isOpen, onClose, parentDirectoryPath }) => {
  const [directoryRelativePath, setDirectoryRelativePath] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { selectedDirectory } = useFileContext()

  useEffect(() => {
    const setupInitialPath = async () => {
      const vaultDirectory = await window.electronStore.getVaultDirectoryForWindow()

      let fullPath = ''
      if (parentDirectoryPath) {
        fullPath = parentDirectoryPath
      } else if (selectedDirectory) {
        fullPath = selectedDirectory
      }

      if (fullPath) {
        const relativePath = await window.path.relative(vaultDirectory, fullPath)
        const pathWithSeparator = relativePath ? `${relativePath}${await window.path.pathSep()}` : ''
        setDirectoryRelativePath(pathWithSeparator)
      }
    }

    if (isOpen) {
      setupInitialPath()
    }
  }, [isOpen, parentDirectoryPath, selectedDirectory])

  useEffect(() => {
    if (!isOpen) {
      setDirectoryRelativePath('')
      setErrorMessage(null)
    }
  }, [isOpen])

  const handleValidName = async (name: string) => {
    const invalidCharacters = await getInvalidCharacterInFilePath(name)
    if (invalidCharacters) {
      setErrorMessage(`Cannot put ${invalidCharacters} in file name`)
      return false
    }
    setErrorMessage(null)
    return true
  }

  const handleNameChange = async (newName: string) => {
    await handleValidName(newName)
    setDirectoryRelativePath(newName)
  }

  const createNewDirectory = async () => {
    const validName = await handleValidName(directoryRelativePath)
    if (!directoryRelativePath || errorMessage || !validName) return

    const directoryPath = await window.electronStore.getVaultDirectoryForWindow()

    const finalPath = await window.path.join(directoryPath, directoryRelativePath)
    window.fileSystem.createDirectory(finalPath)
    posthog.capture('created_new_directory_from_new_directory_modal')
    onClose()
  }

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="my-2 ml-3 mr-6 h-full min-w-[400px]">
        <H3 color="$gray13" fontWeight="semi-bold">
          New Directory
        </H3>
        <Input
          width="100%"
          height="$3"
          fontSize="$1"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$gray7"
          paddingHorizontal="$3"
          paddingVertical="$2"
          focusStyle={{ borderColor: '$blue7', outlineStyle: 'none' }}
          value={directoryRelativePath}
          onChangeText={handleNameChange}
          onKeyPress={(e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
            if (e.nativeEvent.key === 'Enter') {
              createNewDirectory()
            }
          }}
          placeholder="Directory Name"
          marginTop="$3"
          autoFocus
        />

        <div className="flex items-center gap-3">
          <Button
            className="mb-2 mt-3 h-10 w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={createNewDirectory}
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

export default NewDirectoryComponent
