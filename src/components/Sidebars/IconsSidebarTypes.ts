/**
 * Props for the IconsSidebar component.
 */
export interface IconsSidebarProps {
  /**
   * Function to get the description of a shortcut based on its action.
   * @param action - The action identifier for the shortcut.
   * @returns A string description of the shortcut.
   */
  getShortcutDescription: (action: string) => string

  /**
   * Boolean indicating whether the new directory modal is open.
   */
  isNewDirectoryModalOpen: boolean

  /**
   * Function to set the open state of the new directory modal.
   * @param isOpen - Boolean indicating whether the modal should be open.
   */
  setIsNewDirectoryModalOpen: (isOpen: boolean) => void
}
