import React, { useEffect, useRef } from "react"

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
    hideFocusedItem: () => void
}


const CustomContextMenu: React.FC<CustomContextMenuProps> = ({ focusedItem, hideFocusedItem }) => {
    const { currentSelection, locations } = focusedItem
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
        <div 
            ref={menuRef}
            className="absolute bg-white p-8 rounded-md z-[1020]"
            style={{
                left: locations.x,
                top: locations.y,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            }}
        >
            {currentSelection === 'FileSidebar' && <div>FileSidebar Option 1</div>}
            {currentSelection === 'FileItem' && <div></div>}
        </div>
    
    )
}

export default CustomContextMenu
