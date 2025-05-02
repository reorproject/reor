import { create } from 'zustand'

type EditorStateStore = {
  currentFilePath: string | null
  setCurrentFilePath: (path: string | null) => void
}

export const useEditorState = create<EditorStateStore>((set) => ({
  currentFilePath: null,
  setCurrentFilePath: (path) => set({ currentFilePath: path }),
}))
