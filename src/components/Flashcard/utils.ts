import { toast } from 'react-toastify'

import { FlashcardQAPair, FlashcardQAPairUI } from './types'

import { removeFileExtension } from '@/utils/strings'

export const QUESTION_FORMAT = 'Q:'
export const ANSWER_FORMAT = 'A:'
export const CONVERT_TO_FLASHCARDS_FROM_CHAT = 'Convert the above message to flashcards'

const FLASHCARD_DIR = '.flashcards'

export const storeFlashcardPairsAsJSON = async (qnaPairs: FlashcardQAPairUI[], currentFilePath: string | null) => {
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
        qnaPairs: qnaPairs.map((pair) => ({
          ...pair,
          fsrsState: {
            ...pair.fsrsState,
            due: pair.fsrsState.due.toISOString(), 
          },
        })),
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
  const qnaPairs: FlashcardQAPairUI[] = JSON.parse(fileData).qnaPairs.map((pair: any) => ({
    ...pair,
    fsrsState: {
      ...pair.fsrsState,
      due: new Date(pair.fsrsState.due), 
    },
    isFlipped: false,
  }))

  // Sort the flashcards by difficulty in descending order
  qnaPairs.sort((a, b) => b.fsrsState.difficulty - a.fsrsState.difficulty)

  return qnaPairs
}

export const storeFlashcardPairAsJSON = async (updatedPair: FlashcardQAPairUI, currentFilePath: string | null) => {
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

  const fileData = await window.fileSystem.readFile(filePath)
  const existingData = JSON.parse(fileData)

  const updatedQnaPairs = existingData.qnaPairs.map((pair: FlashcardQAPairUI) => 
    pair.question === updatedPair.question ? {
      ...updatedPair,
      fsrsState: {
        ...updatedPair.fsrsState,
        due: updatedPair.fsrsState.due.toISOString(), // Convert Date to string for JSON storage
      },
    } : pair
  )

 
  await window.fileSystem.writeFile({
    filePath,
    content: JSON.stringify(
      {
        ...existingData,
        qnaPairs: updatedQnaPairs,
      },
      null,
      4,
    ),
  })

  toast.success('Flashcard updated!', {
    closeButton: false,
    autoClose: 500,
  })
}
