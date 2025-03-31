import React, { useState } from 'react'

import { Button } from '@material-tailwind/react'
import { toast } from 'react-toastify'

import { YStack, SizableText, Input, XStack } from 'tamagui'
import { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'
import ReorModal from '../Common/Modal'

import { getInvalidCharacterInFileName } from '@/lib/file'
import { useFileContext } from '@/contexts/FileContext'

const RenameNoteModal: React.FC = () => {
  const { noteToBeRenamed, setNoteToBeRenamed, renameFile } = useFileContext()
  const [newNoteName, setNewNoteName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleNameChange = (name: string) => {
    // const newName = e.target.value
    setNewNoteName(name)

    const invalidCharacter = getInvalidCharacterInFileName(name)
    if (invalidCharacter) {
      setErrorMessage(`The character [${invalidCharacter}] cannot be included in note name.`)
    } else {
      setErrorMessage(null)
    }
  }
  const onClose = () => {
    setNoteToBeRenamed('')
  }

  const handleNoteRename = async () => {
    if (errorMessage) {
      return
    }
    if (!newNoteName) {
      toast.error('Note name cannot be empty', {
        className: 'mt-5',
        closeOnClick: false,
        draggable: false,
      })
      return
    }

    const initialNotePathPrefix = await window.path.dirname(noteToBeRenamed)
    const initialPath = await window.path.join(initialNotePathPrefix, newNoteName)
    const outputPath = await window.path.addExtensionIfNoExtensionPresent(initialPath)

    await renameFile(noteToBeRenamed, outputPath)
    onClose()
  }

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      handleNoteRename()
    }
  }

  return (
    <ReorModal isOpen={!!noteToBeRenamed} onClose={onClose}>
      <YStack my={2} ml={3} mr={6} h="100%" minWidth={400}>
        <SizableText mb={3} fontSize={18} fontWeight="bold">
          Rename Note
        </SizableText>

        <Input
          width="100%"
          borderRadius="$4"
          borderWidth={1}
          borderColor="$gray6"
          mt={10}
          value={newNoteName}
          onChangeText={handleNameChange}
          onKeyPress={handleKeyPress}
          fontSize="$1"
          height="$3"
          placeholder="New Note Name"
          focusStyle={{
            borderColor: '$blue6',
            outlineWidth: 0,
          }}
        />

        <XStack alignItems="center" gap={12}>
          <Button
            className="mb-2 mt-3 h-[40px] w-[80px] cursor-pointer border-none bg-blue-500 px-2 py-0 text-center hover:bg-blue-600"
            onClick={handleNoteRename}
          >
            Rename
          </Button>
          {errorMessage && (
            <SizableText fontSize={12} color="$red10">
              {errorMessage}
            </SizableText>
          )}
        </XStack>
      </YStack>
    </ReorModal>
  )
}

export default RenameNoteModal
