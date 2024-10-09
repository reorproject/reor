import { FileInfoNode } from 'electron/main/filesystem/types'
import React, { useEffect, useRef } from 'react'
import { useFileContext } from '@/contexts/FileContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useModalOpeners } from '@/contexts/ModalContext'
import { useWindowContentContext } from '@/contexts/WindowContentContext'
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
  const { focusedItem, hideFocusedItem, createUntitledNote } = useWindowContentContext()
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

  const handleRenameFile = (name: string | undefined) => {
    if (name) setNoteToBeRenamed(name)
  }

  let displayList: MenuItemType[] = []
  switch (currentSelection) {
    case 'FileSidebar': {
      displayList = [
        { title: 'New Note', onSelect: createUntitledNote, icon: '' },
        { title: 'New Directory', onSelect: () => setIsNewDirectoryModalOpen(true), icon: '' },
      ]
      break
    }
    case 'FileItem': {
      displayList = [
        { title: 'Delete', onSelect: () => deleteFile(file?.path), icon: '' },
        {
          title: 'Rename',
          onSelect: () => {
            if (file?.path) setNoteToBeRenamed(file?.path)
          },
          icon: '',
        },
        { title: 'Create flashcard set', onSelect: () => handleMakeFlashcard(file ? file.path : null), icon: '' },
        {
          title: 'Add File to chat context',
          onSelect: () => {}, // handleAddFileToChatFilters(file ? file.path : null),
          icon: '',
        },
      ]
      break
    }
    case 'ChatItem': {
      displayList = [{ title: 'Delete Chat', onSelect: () => deleteChat(chatMetadata?.id), icon: '' }]
      break
    }
    case 'DirectoryItem': {
      displayList = [
        { title: 'New Directory', onSelect: () => setIsNewDirectoryModalOpen(true), icon: '' },
        { title: 'New Note', onSelect: createUntitledNote, icon: '' },
        { title: 'Delete', onSelect: () => deleteFile(file?.path), icon: '' },
        { title: 'Rename', onSelect: () => handleRenameFile(file?.path), icon: '' },
        { title: 'Create flashcard set', onSelect: () => handleMakeFlashcard(file ? file.path : null), icon: '' },
        {
          title: 'Add file to chat context',
          onSelect: () => {}, // handleAddFileToChatFilters(file ? file.path : null),
          icon: '',
        },
      ]
      break
    }
    default:
      break
  }

  // Selects the item then hides menu
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
            {displayList?.map((item) => (
              <div
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
