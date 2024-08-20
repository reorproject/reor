import React from 'react'
import { ImFileEmpty } from 'react-icons/im'
import { useModalOpeners } from './Providers/ModalProvider'
import NewNoteComponent from './File/NewNote'
import NewDirectoryComponent from './File/NewDirectory'

interface EmptyPageProps {
  openFileAndOpenEditor: (filePath: string, optionalContentToWriteOnCreate?: string) => Promise<void>
}

const EmptyPage: React.FC<EmptyPageProps> = ({ openFileAndOpenEditor }) => {
  const { isNewNoteModalOpen, setIsNewNoteModalOpen, isNewDirectoryModalOpen, setIsNewDirectoryModalOpen } =
    useModalOpeners()

  return (
    <div className="absolute flex size-full flex-col items-center justify-center overflow-hidden pb-40 text-white">
      <div className="opacity-10">
        <ImFileEmpty size={168} />
      </div>
      <h3 className="mb-0 opacity-90">No File Selected!</h3>
      <p className="mt-1 opacity-70">Open a file to begin using Reor!</p>
      <div className="m-0 flex max-w-md flex-col gap-2">
        <button
          className="cursor-pointer border-0 bg-transparent pb-1 pr-0 text-left text-2lg text-blue-500"
          onClick={() => setIsNewNoteModalOpen(true)}
          type="button"
        >
          Create a File
        </button>
        <button
          className="cursor-pointer border-0 bg-transparent pb-1 pr-0 text-left text-2lg text-blue-500"
          onClick={() => setIsNewDirectoryModalOpen(true)}
          type="button"
        >
          Create a Folder
        </button>
      </div>
      <NewNoteComponent
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        openFileAndOpenEditor={openFileAndOpenEditor}
        currentOpenFilePath=""
      />
      <NewDirectoryComponent
        isOpen={isNewDirectoryModalOpen}
        onClose={() => setIsNewDirectoryModalOpen(false)}
        currentOpenFilePath=""
      />
    </div>
  )
}

export default EmptyPage
