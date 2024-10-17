import React, { useState } from 'react'
import { ImFileEmpty } from 'react-icons/im'
import { useContentContext } from '@/contexts/ContentContext'
import NewDirectoryComponent from '../File/NewDirectory'

const EmptyPage: React.FC = () => {
  const [isNewDirectoryModalOpen, setIsNewDirectoryModalOpen] = useState(false)
  const { createUntitledNote } = useContentContext()

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
          onClick={() => createUntitledNote()}
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
        <NewDirectoryComponent isOpen={isNewDirectoryModalOpen} onOpenChange={setIsNewDirectoryModalOpen} />
      </div>
    </div>
  )
}

export default EmptyPage
