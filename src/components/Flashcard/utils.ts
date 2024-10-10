import { toast } from 'react-toastify'

import { FlashcardQAPair, FlashcardQAPairUI } from './types'

import { removeFileExtension } from '@/lib/file'

export const QUESTION_FORMAT = 'Q:'
export const ANSWER_FORMAT = 'A:'
export const CONVERT_TO_FLASHCARDS_FROM_CHAT = 'Convert the above message to flashcards'

const FLASHCARD_DIR = '.flashcards'

export const storeFlashcardPairsAsJSON = async (qnaPairs: FlashcardQAPair[], currentFilePath: string | null) => {
  if (!currentFilePath) {
    toast.error('No file currently selected. Please open a file.')
    return
  }
  const fileName = await window.path.basename(currentFilePath)
  const trimmedFileName = removeFileExtension(fileName)
  const filePath = await window.path.join(
    await window.electronStore.getVaultDirectoryForWindow(),
    FLASHCARD_DIR,
    `${trimmedFileName}.json`,
  )
  await window.fileSystem.writeFile({
    filePath,
    content: JSON.stringify(
      {
        fileGeneratedFrom: currentFilePath,
        qnaPairs,
      },
      null,
      4,
    ),
  })
  toast.success('Flashcards stored as file!', {
    closeButton: false,
    autoClose: 500,
  })
}

export const getFlashcardVaultDirectory = async (): Promise<string> => {
  const vaultDirectoryWithFlashcards = await window.path.join(
    await window.electronStore.getVaultDirectoryForWindow(),
    FLASHCARD_DIR,
  )
  return vaultDirectoryWithFlashcards
}

export const getFlashcardQnaPairsFromJsonFile = async (selectedFlashcardFile: string): Promise<FlashcardQAPairUI[]> => {
  if (!selectedFlashcardFile) {
    return []
  }
  const flashcardFullFilePath = await window.path.join(await getFlashcardVaultDirectory(), selectedFlashcardFile)

  const fileData = await window.fileSystem.readFile(flashcardFullFilePath)
  const qnaPairs: FlashcardQAPairUI[] = (JSON.parse(fileData).qnaPairs as FlashcardQAPair[]).map((pair) => ({
    ...pair,
    isFlipped: false,
  }))
  return qnaPairs
}
