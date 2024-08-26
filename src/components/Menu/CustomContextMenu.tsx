import React from "react"

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
}

interface ContextMenuPos {
    x: number
    y: number
}


interface CustomContextMenuProps {
    focusedItem: ContextMenuFocus
}


const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ focusedItem }) => {
    const { currentSelection, locations } = focusedItem

    switch(currentSelection) {
        case 'FileSidebar': {

            break
        }
        case 'EditorContent': {

            break
        }
        case 'FileItem': {

            break
        }
        case 'ChatItem': {

            break
        }
        case 'DirectoryItem': {

            break
        }
    }

    return (
        <div style={{ left: locations.x, top: locations.y }} className="z-4000 size-full bg-white">
            Testing
        </div>
    )
}

export default CustomContextMenu
