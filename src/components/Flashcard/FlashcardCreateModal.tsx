import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@material-tailwind/react'
import { CircularProgress } from '@mui/material'
import posthog from 'posthog-js'
import { TypeAnimation } from 'react-type-animation'

import ReorModal from '../Common/Modal'
import FilesSuggestionsDisplay from '../Editor/BacklinkSuggestionsDisplay'
import { useFileInfoTree } from '../File/FileSideBar/hooks/use-file-info-tree'
import { useFileByFilepath } from '../File/hooks/use-file-by-filepath'

import { FlashcardCore } from './FlashcardsCore'
import { FlashcardQAPairUI } from './types'
import { storeFlashcardPairsAsJSON } from './utils'

interface FlashcardCreateModalProps {
  isOpen: boolean
  onClose: () => void
  initialFlashcardFile?: string
}

const FlashcardCreateModal: React.FC<FlashcardCreateModalProps> = ({ isOpen, onClose, initialFlashcardFile = '' }) => {
  const [flashcardQAPairs, setFlashcardQAPairs] = useState<FlashcardQAPairUI[]>([])
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState<boolean>(false)
  const [currentSelectedFlashcard, setCurrentSelectedFlashcard] = useState<number>(0)
  const [selectedFile, setSelectedFile] = useState<string>(initialFlashcardFile)
  // const [availableFiles, setAvailableFiles] = useState<string[]>([]);
  const [vaultDirectory, setVaultDirectory] = useState<string>('')

  const { flattenedFiles } = useFileInfoTree(vaultDirectory)
  const { suggestionsState, setSuggestionsState } = useFileByFilepath()

  const [searchText, setSearchText] = useState<string>(initialFlashcardFile)
  const inputRef = useRef<HTMLInputElement>(null)

  const initializeSuggestionsStateOnFocus = () => {
    const inputCoords = inputRef.current?.getBoundingClientRect()
    if (!inputCoords) {
      return
    }
    setSuggestionsState({
      position: {
        top: inputCoords.bottom,
        left: inputCoords.x,
      },
      textWithinBrackets: searchText,
      onSelect: async (suggestion: string) => {
        const suggestionWithExtension = await window.path.addExtensionIfNoExtensionPresent(suggestion)
        setSearchText(suggestionWithExtension)
        setSelectedFile(suggestionWithExtension)
        setFlashcardQAPairs([])
        setSuggestionsState(null)
      },
    })
  }

  // handle the creation process
  const createFlashcardsFromFile = async (): Promise<void> => {
    posthog.capture('create_flashcard_from_file')
    // send the file as context to the backend
    const llmName = await window.llm.getDefaultLLMName()
    setIsLoadingFlashcards(true)
    const result = await window.fileSystem.generateFlashcardsWithFile({
      prompt: 'Generate flashcards as json from this file',
      llmName,
      filePath: selectedFile,
    })

    // receive the output as JSON from the backend
    // store the flashcards in memory so that we can render it in flashcardQA pairs
    // and set UI as flipped = false
    const flashcardUIPairs: FlashcardQAPairUI[] = (JSON.parse(result).flashcards as { Q: string; A: string }[]).map(
      (card) => ({
        question: card.Q,
        answer: card.A,
        isFlipped: false,
      }),
    )
    setFlashcardQAPairs(flashcardUIPairs)
    setIsLoadingFlashcards(false)

    storeFlashcardPairsAsJSON(flashcardUIPairs, selectedFile)
  }

  // find all available files
  useEffect(() => {
    const setFileDirectory = async () => {
      const windowDirectory = await window.electronStore.getVaultDirectoryForWindow()
      setVaultDirectory(windowDirectory)
    }
    setFileDirectory()
  }, [])

  return (
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="mx-6 mb-6 mt-2 h-full w-[800px]">
        <h2 className="mb-3 text-xl font-semibold text-white">
          Select a file to generate flashcards for:
          <input
            ref={inputRef}
            type="text"
            className=" mt-6 box-border block h-[40px] w-full rounded-md border border-gray-300 px-3
            py-2 transition duration-150
            ease-in-out focus:border-blue-300 focus:outline-none"
            value={searchText}
            onSelect={() => initializeSuggestionsStateOnFocus()}
            onChange={(e) => {
              setSearchText(e.target.value)
              if (e.target.value.length == 0) {
                setSelectedFile('')
              }
            }}
            placeholder="Search for the files by name"
          />
          {suggestionsState && (
            <FilesSuggestionsDisplay
              suggestionsState={suggestionsState}
              suggestions={flattenedFiles.map((file) => file.path)}
              maxWidth="w-[800px]"
            />
          )}
        </h2>
        {!selectedFile && (
          <p className="text-xs text-red-500">Choose a file by searching or by right clicking a file in directory</p>
        )}
        {isLoadingFlashcards && flashcardQAPairs.length == 0 && (
          <div>
            <TypeAnimation
              className="mb-3 text-xl font-semibold text-white"
              sequence={[
                // Same substring at the start will only be typed out once, initially
                'We are working hard to generate questions',
                500, // wait 0.5 before replacing "question" with "answers"
                'We are working hard to generate answers',
                500,
                'We are working hard to pair questions and answers together',
                500,
                'We should be ready any time now......',
                500,
              ]}
              wrapper="span"
              speed={50}
            />
          </div>
        )}
        <FlashcardCore
          flashcardQAPairs={flashcardQAPairs}
          setFlashcardQAPairs={setFlashcardQAPairs}
          currentSelectedFlashcard={currentSelectedFlashcard}
          setCurrentSelectedFlashcard={setCurrentSelectedFlashcard}
        />
        <div className="flex justify-end">
          {selectedFile && (
            <Button
              className="vertical-align mt-4 h-20 w-96 cursor-pointer border-none bg-slate-600
            text-center
            text-white
            transition-transform duration-300
            hover:-translate-y-2
            disabled:pointer-events-none
            disabled:opacity-25"
              onClick={() => createFlashcardsFromFile()}
              // Write to the flashcards directory if the flashcards generated are valid
              // onClick={async () => await storeFlashcardPairsAsJSON(flashcardQAPairs, fileToGenerateFlashcardsFor)}
              placeholder=""
              disabled={isLoadingFlashcards}
            >
              <div className="flex h-full items-center justify-around space-x-2 ">
                Generate cards {isLoadingFlashcards && <CircularProgress />}
              </div>
            </Button>
          )}
        </div>
      </div>
    </ReorModal>
  )
}

export default FlashcardCreateModal
