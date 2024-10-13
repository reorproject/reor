import React from 'react'
import { FileInfoNode } from 'electron/main/filesystem/types'
import { useFileContext } from '@/contexts/FileContext'
import { useChatContext } from '@/contexts/ChatContext'
import { useModalOpeners } from '@/contexts/ModalContext'
import { useContentContext } from '@/contexts/ContentContext'
import { ChatMetadata } from '../../lib/llm/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

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

  const { setIsNewDirectoryModalOpen, setIsFlashcardModeOpen, setInitialFileToCreateFlashcard } = useModalOpeners()

  const { deleteFile, setNoteToBeRenamed } = useFileContext()
  const { deleteChat } = useChatContext()

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
    <DropdownMenu open={currentSelection !== 'None'} onOpenChange={hideFocusedItem}>
      <DropdownMenuTrigger asChild>
        <div style={{ position: 'fixed', left: position.x, top: position.y }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32 cursor-pointer text-xs">
        {displayList.map((item) => (
          <DropdownMenuItem className="text-xs" key={item.title} onSelect={() => handleSubmit(item)}>
            {item.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomContextMenu
