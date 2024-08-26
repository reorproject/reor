
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
    
}






const CustomContextMenu = (focusedItem: ContextMenuLocations) => {
    switch(focusedItem) {
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
}

export default CustomContextMenu
