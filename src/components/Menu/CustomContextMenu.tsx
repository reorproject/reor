import { FileInfoNode } from "electron/main/filesystem/types"
import React, { useEffect, useRef } from "react"
import { ChatHistoryMetadata } from "../Chat/hooks/use-chat-history"
import { deleteFileItem } from "./ContextMenuActions"
import { Editor } from "@tiptap/react"

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
    chatRow?: ChatHistoryMetadata 
}

interface ContextMenuPos {
    x: number
    y: number
}


interface CustomContextMenuProps {
    focusedItem: ContextMenuFocus
    hideFocusedItem: () => void
    editor: Editor | null
    setFilePath: (path: string) => void
}


const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ 
    focusedItem, 
    hideFocusedItem,
    editor,
    setFilePath,
}) => {
    const { currentSelection, locations, file, chatRow } = focusedItem
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

    let displayList = null
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
                {title: 'Delete', onSelect: () => deleteFileItem(file?.path), icon: ''},
                {title: 'Rename', onSelect: null, icon: ''},
                {title: 'Create flashcard set', onSelect: null, icon: ''},
                {title: 'Add File to chat context', onSelect: null, icon: ''},
            ]
            break
        }
        case 'ChatItem': {
            displayList = [
                {title: 'Delete Chat', onSelect: null, icon: ''},
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

    return (
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
                        onClick={item.onSelect ? item.onSelect : () =>  {}}
                    >
                        {item.title}
                    </div>
                ))}
            </div>
        </div>
    
    )
}



export default CustomContextMenu
