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
    <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-between gap-1">
      <div
        className=" flex items-center justify-center w-full h-8 cursor-pointer"
        onClick={() => makeSidebarShow('files')}
      >
        <IconContext.Provider value={{ color: sidebarShowing === 'files' ? 'salmon' : '' }}>
          <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
            <ImFilesEmpty className="mx-auto text-gray-200 " size={22} title="Files" />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className=" flex items-center justify-center w-full h-8 cursor-pointer"
        onClick={() => makeSidebarShow('chats')}
      >
        <IconContext.Provider value={{ color: sidebarShowing === 'chats' ? 'salmon' : '' }}>
          <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
            <IoChatbubbleEllipsesOutline
              className="text-gray-100 cursor-pointer "
              size={22}
              title={sidebarShowing === 'chats' ? 'Close Chatbot' : 'Open Chatbot'}
            />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className="flex items-center justify-center w-full h-8 cursor-pointer"
        onClick={() => makeSidebarShow('search')}
      >
        <IconContext.Provider value={{ color: sidebarShowing === 'search' ? 'salmon' : '' }}>
          <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
            <FaSearch size={18} className=" text-gray-200" title="Semantic Search" />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className="bg-transparent border-none cursor-pointer flex items-center justify-center w-full h-8 "
        onClick={() => setIsNewNoteModalOpen(true)}
      >
        <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
          <VscNewFile className="text-gray-200" size={22} title="New Note" />
        </div>
      </div>
      <div
        className="bg-transparent mt-[2px] border-none cursor-pointer flex items-center justify-center w-full h-8 "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
          <VscNewFolder className="text-gray-200" size={22} title="New Directory" />
          {/* < /> */}
        </div>
      </div>
      <div
        className="bg-transparent border-none cursor-pointer flex items-center justify-center w-full h-8 "
        onClick={() => setIsFlashcardModeOpen(true)}
      >
        <div className="rounded w-[80%] h-[80%] flex items-center justify-center hover:bg-neutral-700">
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
      <div className="flex-grow border-1 border-yellow-300" />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <div
        className="bg-transparent border-none pb-2 mb-[2px] cursor-pointer flex items-center justify-center w-full"
        onClick={() => window.electronUtils.openNewWindow()}
      >
        <GrNewWindow className="text-gray-100" size={21} title="Open New Vault" />
      </div>
      <button
        className="bg-transparent border-none pb-2 cursor-pointer flex items-center justify-center w-full"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
      >
        <MdSettings className="h-6 w-6 text-gray-100" title="Settings" />
      </button>
    </div>
  )
}

export default IconsSidebar
