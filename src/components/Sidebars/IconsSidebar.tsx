import React, { useEffect, useMemo, useState } from 'react'

import { IconContext } from 'react-icons'
import { FaSearch } from 'react-icons/fa'
import { GrNewWindow } from 'react-icons/gr'
import { ImFilesEmpty } from 'react-icons/im'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import { MdOutlineQuiz, MdSettings } from 'react-icons/md'
import { VscNewFolder } from 'react-icons/vsc'
import { HiOutlinePencilAlt } from 'react-icons/hi'

import NewDirectoryComponent from '../File/NewDirectory'
import NewNoteComponent from '../File/NewNote'
import FlashcardMenuModal from '../Flashcard/FlashcardMenuModal'
import SettingsModal from '../Settings/Settings'
import { SidebarAbleToShow } from './MainSidebar'

interface IconsSidebarProps {
  openRelativePath: (path: string) => void
  sidebarShowing: SidebarAbleToShow
  makeSidebarShow: (show: SidebarAbleToShow) => void
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

    window.ipcRenderer.receive('add-new-note-response', (relativePath: string) => {
      handleNewNote(relativePath)
    })
  }, [])

  // open a new directory window
  useEffect(() => {
    const handleNewDirectory = (dirPath: string) => {
      setCustomDirectoryPath(dirPath)
      setIsNewDirectoryModalOpen(true)
    }

    window.ipcRenderer.receive('add-new-directory-response', (dirPath) => {
      handleNewDirectory(dirPath)
    })
  }, [])

  const filesIconContextValue = useMemo(
    () => ({ color: sidebarShowing === 'files' ? 'white' : 'gray' }),
    [sidebarShowing],
  )
  const chatsIconContextValue = useMemo(
    () => ({ color: sidebarShowing === 'chats' ? 'white' : 'gray' }),
    [sidebarShowing],
  )
  const searchIconContextValue = useMemo(
    () => ({ color: sidebarShowing === 'search' ? 'white' : 'gray' }),
    [sidebarShowing],
  )
  const newFileContextValue = useMemo(() => ({ color: 'gray' }), [])
  const newFolderContextValue = useMemo(() => ({ color: 'gray' }), [])
  const mdOutlineContextValue = useMemo(() => ({ color: 'gray' }), [])
  const grNewWindow = useMemo(() => ({ color: 'gray' }), [])
  const mdSettings = useMemo(() => ({ color: 'gray' }), [])

  return (
    <div className="flex size-full flex-col items-center justify-between gap-1 bg-neutral-800">
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => makeSidebarShow('files')}
      >
        <IconContext.Provider value={filesIconContextValue}>
          <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
            <ImFilesEmpty className="mx-auto text-gray-200 " size={18} title="Files" />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className=" flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => makeSidebarShow('chats')}
      >
        <IconContext.Provider value={chatsIconContextValue}>
          <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
            <IoChatbubbleEllipsesOutline
              className="cursor-pointer text-gray-100 "
              size={18}
              title={sidebarShowing === 'chats' ? 'Close Chatbot' : 'Open Chatbot'}
            />
          </div>
        </IconContext.Provider>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center"
        onClick={() => makeSidebarShow('search')}
      >
        <IconContext.Provider value={searchIconContextValue}>
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
          <IconContext.Provider value={newFileContextValue}>
            <HiOutlinePencilAlt className="text-gray-200" size={22} title="New Note" />
          </IconContext.Provider>
        </div>
      </div>
      <div
        className="mt-[2px] flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsNewDirectoryModalOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <IconContext.Provider value={newFolderContextValue}>
            <VscNewFolder className="text-gray-200" size={18} title="New Directory" />
          </IconContext.Provider>
        </div>
      </div>
      <div
        className="flex h-8 w-full cursor-pointer items-center justify-center border-none bg-transparent "
        onClick={() => setIsFlashcardModeOpen(true)}
      >
        <div className="flex size-4/5 items-center justify-center rounded hover:bg-neutral-700">
          <IconContext.Provider value={mdOutlineContextValue}>
            <MdOutlineQuiz className="text-gray-200" size={19} title="Flashcard quiz" />
          </IconContext.Provider>
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
            setIsFlashcardModeOpen(false)
            setInitialFileToCreateFlashcard('')
            setInitialFileToReviewFlashcard('')
          }}
          initialFileToCreateFlashcard={initialFileToCreateFlashcard}
          initialFileToReviewFlashcard={initialFileToReviewFlashcard}
        />
      )}
      <div className="grow border-yellow-300" />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <div
        className="mb-[2px] flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => window.electronUtils.openNewWindow()}
      >
        <IconContext.Provider value={grNewWindow}>
          <GrNewWindow className="text-gray-100" size={18} title="Open New Vault" />
        </IconContext.Provider>
      </div>
      <button
        className="flex w-full cursor-pointer items-center justify-center border-none bg-transparent pb-2"
        onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)}
        type="button"
        aria-label="Open Settings"
      >
        <IconContext.Provider value={mdSettings}>
          <MdSettings size={18} className="mb-3 size-6 text-gray-100" title="Settings" />
        </IconContext.Provider>
      </button>
    </div>
  )
}

export default IconsSidebar
