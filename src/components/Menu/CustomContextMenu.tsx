import { FileInfoNode } from "electron/main/filesystem/types"
import React, { useEffect, useRef } from "react"
import { ChatHistoryMetadata } from "../Chat/hooks/use-chat-history"

/**
 * Name of component that user right clicked on.
 * Used to define the type for our useState
 */
export type ContextMenuLocations = 
    | 'FileSidebar'
    | 'EditorContent'
    | 'FileItem'
    | 'ChatItem'
    | 'DirectoryItem'
    | 'None'

export interface ContextMenuFocus {
    currentSelection: ContextMenuLocations
    locations: ContextMenuPos
    file?: FileInfoNode
    chatMetadata?: ChatHistoryMetadata 
}

export type HandleFocusedItemType = (
    event: React.MouseEvent<HTMLDivElement>, 
    focusedItem: ContextMenuLocations,
    additionalData?: Partial<Omit<ContextMenuFocus, 'currentSelection' | 'locations'>>
) => void;

interface ContextMenuPos {
    x: number
    y: number
}


interface CustomContextMenuProps {
    focusedItem: ContextMenuFocus
    setFocusedItem: (item: ContextMenuFocus) => void
    hideFocusedItem: () => void
    handleDeleteFile: (path: string | undefined) => void
    handleDeleteChat: (chatID: string | undefined) => void
}

interface MenuItemType {
    title: string
    onSelect: ((...args: any[]) => void) | null
    icon: string
}

const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ 
    focusedItem,
    setFocusedItem,
    hideFocusedItem,
    handleDeleteFile,
    handleDeleteChat,
}) => {
    const { currentSelection, locations, file, chatMetadata } = focusedItem
    const menuRef = useRef<HTMLDivElement>(null)
    
    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                hideFocusedItem()
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick)
        }
    }, [hideFocusedItem])

    if (currentSelection === 'None') return null

    let displayList: MenuItemType[] = []
    switch(currentSelection) {
        case 'FileSidebar': {
            displayList = [
                {title: 'New Note', onSelect: null, icon: ''},
                {title: 'New Directory', onSelect: null, icon: ''},
            ]
            break
        }
        case 'EditorContent': {

            break
        }
        case 'FileItem': {
            displayList = [
                {title: 'Delete', onSelect: () => handleDeleteFile(file?.path), icon: ''},
                {title: 'Rename', onSelect: null, icon: ''},
                {title: 'Create flashcard set', onSelect: null, icon: ''},
                {title: 'Add File to chat context', onSelect: null, icon: ''},
            ]
            break
        }
        case 'ChatItem': {
            displayList = [
                {title: 'Delete Chat', onSelect: () => handleDeleteChat(chatMetadata?.id), icon: ''},
            ]
            break
        }
        case 'DirectoryItem': {
            displayList = [
                {title: 'New Directory', onSelect: null, icon: ''},
                {title: 'New Note', onSelect: null, icon: ''},
                {title: 'Delete', onSelect: null, icon: ''},
                {title: 'Rename', onSelect: null, icon: ''},
                {title: 'Create flashcard set', onSelect: null, icon: ''},
                {title: 'Add file to chat context', onSelect: null, icon: ''},
            ]
            break
        }
    }

    // Selects the item then hides menu
    const handleSubmit = (item: MenuItemType) => {
      if (item.onSelect)
       item.onSelect()
      setFocusedItem((prevItem: ContextMenuFocus) => ({
        ...prevItem,
        currentSelection: 'None' as ContextMenuLocations,
      }))
      console.log("Previous item:", focusedItem)
    }

    useEffect(() => {

    },)

    return (
      <div>
        {focusedItem.currentSelection !== 'None' && (
          <div 
            ref={menuRef}
            className="absolute p-2 rounded-md z-[1020] bg-[#1E1E1E] overflow-y-auto"
            style={{
             left: locations.x,
              top: locations.y,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* TODO: onClick is a temporarily fix since not everyhing is implemented. */}
            <div className="flex flex-col">
              {displayList?.map((item, index) => (
                <div
                  key={index}
                  className="text-[11px] text-white/90 cursor-pointer hover:bg-blue-500 hover:rounded-md px-2 py-1"
                  onClick={item.onSelect ? item.onSelect : () => {}}
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
