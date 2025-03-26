import React from 'react'
import { SizableText, YStack } from 'tamagui'
import { File } from '@tamagui/lucide-icons'
import { useContentContext } from '@/contexts/ContentContext'
import { useModalOpeners } from '@/contexts/ModalContext'

const EmptyPage: React.FC = () => {
  const { setIsNewDirectoryModalOpen } = useModalOpeners()
  const { createUntitledNote } = useContentContext()

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="mb-2 opacity-10">
          <File size={168} color="$brand3" />
        </div>
        <SizableText color="$gray11" size="$6" fontWeight={400} className="mb-0">
          No File Selected!
        </SizableText>
        <SizableText color="$gray11" paddingTop={6}>
          Open a file and get back to work!
        </SizableText>
        <YStack paddingTop={20}>
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
        </YStack>
      </div>
    </div>
  )
}

export default EmptyPage
