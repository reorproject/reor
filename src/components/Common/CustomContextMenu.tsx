import React, { useEffect, useRef } from 'react'
import { FileInfoNode } from 'electron/main/filesystem/types'
import { useFileContext } from '@/contexts/FileContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useModalOpeners } from '@/contexts/ModalContext'
import { useContentContext } from '@/contexts/ContentContext'
import { ChatMetadata } from '../../lib/llm/types'

export type ContextMenuLocations = 'FileSidebar' | 'FileItem' | 'ChatItem' | 'DirectoryItem' | 'None'

export interface AdditionalContextMenuData {
  file?: FileInfoNode
  chatMetadata?: ChatMetadata
}

export interface OnShowContextMenuData extends AdditionalContextMenuData {
  currentSelection: ContextMenuLocations
  position: Position
}

export type ShowContextMenuInputType = (
  event: React.MouseEvent<HTMLDivElement>,
  locationOnScreen: ContextMenuLocations,
  additionalData?: AdditionalContextMenuData,
) => void

interface Position {
  x: number
  y: number
}

interface MenuItemType {
  title: string
  onSelect: ((...args: any[]) => void) | null
  icon: string
}

const CustomContextMenu: React.FC = () => {
  const { focusedItem, hideFocusedItem, createUntitledNote } = useContentContext()
  const { currentSelection, position, file, chatMetadata } = focusedItem
  const menuRef = useRef<HTMLDivElement>(null)

  const { setIsNewDirectoryModalOpen, setIsFlashcardModeOpen, setInitialFileToCreateFlashcard } = useModalOpeners()

  const { deleteFile, setNoteToBeRenamed } = useFileContext()
  const { deleteChat } = useChatContext()

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        hideFocusedItem()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)

    const menuElement = menuRef.current
    if (menuElement) {
      const { height } = menuElement.getBoundingClientRect()
      if (position.y + height > window.innerHeight) {
        menuElement.style.top = `${window.innerHeight - height - 10}px`
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [hideFocusedItem, position.y])

  const handleMakeFlashcard = (noteName: string | null) => {
    if (!noteName) return
    setIsFlashcardModeOpen(!!noteName)
    setInitialFileToCreateFlashcard(noteName)
  }

  const menuItems = {
    newNote: { title: 'New Note', onSelect: createUntitledNote, icon: '' },
    newDirectory: { title: 'New Directory', onSelect: () => setIsNewDirectoryModalOpen(true), icon: '' },
    delete: { title: 'Delete', onSelect: () => deleteFile(file?.path), icon: '' },
    rename: {
      title: 'Rename',
      onSelect: () => file?.path && setNoteToBeRenamed(file.path),
      icon: '',
    },
    createFlashcard: {
      title: 'Create flashcard set',
      onSelect: () => handleMakeFlashcard(file?.path ?? null),
      icon: '',
    },
    deleteChat: { title: 'Delete Chat', onSelect: () => deleteChat(chatMetadata?.id), icon: '' },
  }

  const menuConfigurations: Record<Exclude<ContextMenuLocations, 'None'>, MenuItemType[]> = {
    FileSidebar: [menuItems.newNote, menuItems.newDirectory],
    FileItem: [menuItems.delete, menuItems.rename, menuItems.createFlashcard],
    ChatItem: [menuItems.deleteChat],
    DirectoryItem: [
      menuItems.newDirectory,
      menuItems.newNote,
      menuItems.delete,
      menuItems.rename,
      menuItems.createFlashcard,
    ],
  }

  const displayList = currentSelection !== 'None' ? menuConfigurations[currentSelection] : []

  const handleSubmit = (item: MenuItemType) => {
    if (item.onSelect) item.onSelect()
    hideFocusedItem()
  }

  return (
    <div>
      {focusedItem.currentSelection !== 'None' && (
        <div
          ref={menuRef}
          className="absolute z-[1020] overflow-y-auto rounded-md border-solid border-gray-700 bg-[#1E1E1E] px-1 py-2"
          style={{
            left: position.x,
            top: position.y,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div className="flex flex-col">
            {displayList.map((item, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="cursor-pointer px-2 py-1 text-[12px] text-white/90 hover:rounded-md hover:bg-blue-500"
                onClick={() => handleSubmit(item)}
              >
                {item.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomContextMenu
