import { create } from 'zustand'
// import { FileMetadata } from '@/lib/llm/types'
import { FileInfo } from 'electron/main/filesystem/types'

type FileSearchIndexState = {
  index: Map<string, FileInfo>

  hydrate: (entries: FileInfo[]) => void

  // Asynchronous methods
  add: (metadata: FileInfo) => Promise<void>
  rename: (oldName: string, newName: string) => Promise<void>
  move: (fileName: string, newPath: string) => Promise<void>
  remove: (fileName: string) => Promise<void>

  getPath: (fileName: string) => string | undefined
  getMetadata: (fileName: string) => FileInfo | undefined
}

const useFileSearchIndex = create<FileSearchIndexState>((set, get) => ({
  index: new Map(),

  hydrate: (entries) => {
    const map = new Map(entries.map((e) => [e.name, e]))
    set({ index: map })
  },

  add: async (metadata) => {
    set((s) => {
      const newMap = new Map(s.index)
      newMap.set(metadata.name, metadata)
      return { index: newMap }
    })
  },

  rename: async (oldName, newName) => {
    const file = get().index.get(oldName)
    if (!file) return
    const newPath = file.path.replace(file.name, newName)
    await window.fileSystem.renameFile({ oldFilePath: file.path, newFilePath: newPath })
    set((s) => {
      const newMap = new Map(s.index)
      newMap.delete(oldName)
      newMap.set(newName, { ...file, name: newName, path: newPath })
      return { index: newMap }
    })
  },

  move: async (fileName, newPath) => {
    const file = get().index.get(fileName)
    if (!file) return
    await window.fileSystem.renameFile({ oldFilePath: file.path, newFilePath: newPath })
    set((s) => {
      const newMap = new Map(s.index)
      newMap.set(fileName, { ...file, path: newPath })
      return { index: newMap }
    })
  },

  remove: async (fileName) => {
    const file = get().index.get(fileName)
    if (!file) return
    await window.fileSystem.deleteFile(file.path)
    set((s) => {
      const newMap = new Map(s.index)
      newMap.delete(fileName)
      return { index: newMap }
    })
  },

  getPath: (name) => get().index.get(name)?.path,
  getMetadata: (name) => get().index.get(name),
}))

export default useFileSearchIndex
