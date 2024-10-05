import React, { useEffect } from 'react'

import posthog from 'posthog-js'

import { useFileContext } from '@/contexts/FileContext'
import { useWindowContentContext } from '@/contexts/WindowContentContext'

interface NewNoteComponentProps {
  isOpen: boolean
  onClose: () => void
}

const NewNoteComponent: React.FC<NewNoteComponentProps> = ({ isOpen, onClose }) => {
  const { openContent: openTabContent } = useWindowContentContext()
  const { currentlyOpenFilePath } = useFileContext()

  const createNewFile = async () => {
    let fileName = 'Untitled'
    let index = 0

    if (currentlyOpenFilePath) {
      const directoryName = await window.path.dirname(currentlyOpenFilePath)
      const files = await window.fileSystem.getAllFilenamesInDirectory(directoryName)
      while (files.includes(`${fileName}.md`)) {
        index += 1
        fileName = `Untitled ${index}`
      }
    }
    return fileName
  }

  const sendNewNoteMsg = async () => {
    const fileName = await createNewFile()

    let finalPath = fileName
    if (currentlyOpenFilePath) {
      const directoryName = await window.path.dirname(currentlyOpenFilePath)
      finalPath = await window.path.join(directoryName, fileName)
    }

    const basename = await window.path.basename(finalPath)
    openTabContent(finalPath, `# ${basename}\n`)
    posthog.capture('created_new_note_from_new_note_modal')
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      sendNewNoteMsg()
    }
  })

  return null
}

export default NewNoteComponent
