import React from 'react'
import { ImFileEmpty } from 'react-icons/im'
import { useContentContext } from '@/contexts/ContentContext'
import { useModalOpeners } from '@/contexts/ModalContext'

const EmptyPage: React.FC = () => {
  const { setIsNewDirectoryModalOpen } = useModalOpeners()
  const { createUntitledNote } = useContentContext()

  return (
    <div className="flex size-full flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center">
        <div className="opacity-10">
          <ImFileEmpty size={168} />
        </div>
        <h3 className="mb-0 opacity-90">No File Selected!</h3>
        <p className="mt-1 opacity-70">Open a file and get back to work!</p>
        <div className="mt-2 flex flex-col gap-2">
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
        </div>
      </div>
    </div>
  )
}

export default EmptyPage
