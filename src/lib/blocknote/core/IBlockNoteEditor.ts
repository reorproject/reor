// Needed to prevent circular dependency errors

// TODO: Change these to proper types
export interface IBlockNoteEditor {
  isEditable: boolean
  focus(): void
  insertBlocks: (...args: any) => void
  updateBlock: (...args: any) => void
  removeBlocks: (...args: any) => void
  replaceBlocks: (...args: any) => void
  getSelection(): any
  getTextCursorPosition(): any
}
