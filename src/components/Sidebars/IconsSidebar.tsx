import React, { useEffect, useState } from 'react'

import { IconContext } from 'react-icons'
import { FaSearch } from 'react-icons/fa'
import { GrNewWindow } from 'react-icons/gr'
import { ImFilesEmpty } from 'react-icons/im'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import { MdOutlineQuiz, MdSettings } from 'react-icons/md'
import { VscNewFile, VscNewFolder } from 'react-icons/vsc'

import NewDirectoryComponent from '../File/NewDirectory'
import NewNoteComponent from '../File/NewNote'
import FlashcardMenuModal from '../Flashcard/FlashcardMenuModal'
import { SidebarAbleToShow } from '../MainPage'
import SettingsModal from '../Settings/Settings'

interface IconsSidebarProps {
  openRelativePath: (path: string) => void
  sidebarShowing: SidebarAbleToShow
  makeSidebarShow: (show: SidebarAbleToShow) => void
  filePath: string | null
}

const IconsSidebar: React.FC<IconsSidebarProps> = ({ openRelativePath, sidebarShowing, makeSidebarShow }) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false)
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const [isFlashcardModeOpen, setIsFlashcardModeOpen] = useState(false)
  const [customDirectoryPath, setCustomDirectoryPath] = useState('')
  const [customFilePath, setCustomFilePath] = useState('')

  const [initialFileToCreateFlashcard, setInitialFileToCreateFlashcard] = useState('')
  const [initialFileToReviewFlashcard, setInitialFileToReviewFlashcard] = useState('')

  // open a new flashcard create mode
  useEffect(() => {
    const createFlashcardFileListener = window.ipcRenderer.receive(
      'create-flashcard-file-listener',
      (noteName: string) => {
        setIsFlashcardModeOpen(!!noteName)
        setInitialFileToCreateFlashcard(noteName)
      },
    )

    return () => {
      createFlashcardFileListener()
    }
  }, [])

  // open a new note window
  useEffect(() => {
    const handleNewNote = (relativePath: string) => {
      setCustomFilePath(relativePath)
      setIsNewNoteModalOpen(true)
    }

    window.ipcRenderer.receive('add-new-note-listener', (relativePath: string) => {
      handleNewNote(relativePath)
    })
  }, [])

  // open a new directory window
  useEffect(() => {
    const handleNewDirectory = (dirPath: string) => {
      setCustomDirectoryPath(dirPath)
      setIsNewDirectoryModalOpen(true)
    }

    window.ipcRenderer.receive('add-new-directory-listener', (dirPath) => {
      handleNewDirectory(dirPath)
    })
  }, [])

  return (
    <div className="flex size-full flex-col items-center justify-between gap-1 bg-neutral-800">
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => makeSidebarShow('files')}
      >
        <IconContext.Provider value={{ color: sidebarShowing === 'files' ? 'salmon' : '' }}>
          <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
            <ImFilesEmpty className="mx-auto text-gray-200 " size={22} title="Files" />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => makeSidebarShow('chats')}
      >
        <IconContext.Provider value={{ color: sidebarShowing === 'chats' ? 'salmon' : '' }}>
          <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
            <IoChatbubbleEllipsesOutline
              className="cursor-pointer text-gray-100 "
              size={22}
              title={sidebarShowing === 'chats' ? 'Close Chatbot' : 'Open Chatbot'}
            />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => makeSidebarShow('search')}
      >
        <IconContext.Provider value={{ color: sidebarShowing === 'search' ? 'salmon' : '' }}>
          <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
            <FaSearch size={18} className=" text-gray-200" title="Semantic Search" />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsNewNoteModalOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <VscNewFile className="text-gray-200" size={22} title="New Note" />
        </div>
      </div>
      <div
        className="mt-[2px] flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <VscNewFolder className="text-gray-200" size={22} title="New Directory" />
          {/* < /> */}
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsFlashcardModeOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <MdOutlineQuiz className="text-gray-200" size={23} title="Flashcard quiz" />
          {/* < /> */}
        </div>
      </div>

      <NewNoteComponent
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        openRelativePath={openRelativePath}
        customFilePath={customFilePath}
      />
      <NewDirectoryComponent
        isOpen={isNewDirectoryModalOpen}
        onClose={() => setIsNewDirectoryModalOpen(false)}
        onDirectoryCreate={customDirectoryPath}
      />
      {isFlashcardModeOpen && (
        <FlashcardMenuModal
          isOpen={isFlashcardModeOpen}
          onClose={() => {
            console.log('clicked')
            setIsFlashcardModeOpen(false)
            setInitialFileToCreateFlashcard('')
            setInitialFileToReviewFlashcard('')
          }}
          initialFileToCreateFlashcard={initialFileToCreateFlashcard}
          initialFileToReviewFlashcard={initialFileToReviewFlashcard}
        />
      )}
      <div className="border-1 grow border-yellow-300" />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <div
        className="mb-[2px] flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => window.electronUtils.openNewWindow()}
      >
        <GrNewWindow className="text-gray-100" size={21} title="Open New Vault" />
      </div>
      <button
        className="flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
      >
        <MdSettings className="size-6 text-gray-100" title="Settings" />
      </button>
    </div>
  )
}

export default IconsSidebar
