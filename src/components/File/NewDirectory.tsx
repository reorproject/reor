import React, { useEffect, useState } from 'react'
import posthog from 'posthog-js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { getInvalidCharacterInFileName } from '@/lib/file'
import { useFileContext } from '@/contexts/FileContext'

interface NewDirectoryComponentProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  parentDirectoryPath?: string
}

const NewDirectoryComponent: React.FC<NewDirectoryComponentProps> = ({ isOpen, onOpenChange, parentDirectoryPath }) => {
  const [directoryName, setDirectoryName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { currentlyOpenFilePath } = useFileContext()

  useEffect(() => {
    if (!isOpen) {
      setDirectoryName('')
      setErrorMessage(null)
    }
  }, [isOpen])

  const handleValidName = async (name: string) => {
    const invalidCharacters = await getInvalidCharacterInFileName(name)
    if (invalidCharacters) {
      setErrorMessage(`Cannot put ${invalidCharacters} in file name`)
      return false
    }
    setErrorMessage(null)
    return true
  }

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    await handleValidName(newName)
    setDirectoryName(newName)
  }

  const sendNewDirectoryMsg = async () => {
    const validName = await handleValidName(directoryName)
    if (!directoryName || errorMessage || !validName) return

    let directoryPath: string

    if (parentDirectoryPath) {
      directoryPath = parentDirectoryPath
    } else if (currentlyOpenFilePath && currentlyOpenFilePath !== '') {
      directoryPath = await window.path.dirname(currentlyOpenFilePath)
    } else {
      directoryPath = await window.electronStore.getVaultDirectoryForWindow()
    }

    const finalPath = await window.path.join(directoryPath, directoryName)
    window.fileSystem.createDirectory(finalPath)
    posthog.capture('created_new_directory_from_new_directory_modal')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Directory</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="text"
            value={directoryName}
            onChange={handleNameChange}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                sendNewDirectoryMsg()
              }
            }}
            placeholder="Directory Name"
            autoFocus
          />
          {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
          <Button onClick={sendNewDirectoryMsg}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NewDirectoryComponent
