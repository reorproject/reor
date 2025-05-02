import { create } from 'zustand'
import { DBQueryResult } from 'electron/main/vector-database/schema'

type EditorStateStore = {
  currentFilePath: string | null
  setCurrentFilePath: (path: string | null) => void
}

type SemanticEntry = {
  data: DBQueryResult[]
  lastFetched: number
  isStale: boolean
}

type SemanticCacheState = {
  semanticCache: Record<string, SemanticEntry>
  getSemanticData: (filePath: string) => SemanticEntry
  setSemanticData: (filePath: string, data: DBQueryResult[]) => void
  markStale: (filePath: string) => void
  shouldRefetch: (filePath: string, thresholdMs?: number) => boolean
}

export const useEditorState = create<EditorStateStore>((set) => ({
  currentFilePath: null,
  setCurrentFilePath: (path) => set({ currentFilePath: path }),
}))

export const useSemanticCache = create<SemanticCacheState>((set, get) => ({
  semanticCache: {},

  setSemanticData: (filePath: string, data: DBQueryResult[]) => {
    set((state) => ({
      semanticCache: {
        ...state.semanticCache,
        [filePath]: {
          data,
          lastFetched: Date.now(),
          isStale: false,
        }
      }
    }))
  },

  getSemanticData: (filePath: string) => {
    return get().semanticCache[filePath]
  },

  markStale: (filePath: string) => {
    set((state) => {
      const entry = state.semanticCache[filePath]
      if (!entry) return {}
      return {
        semanticCache: {
          ...state.semanticCache,
          [filePath]: {
            ...entry,
            isStale: true,
          }
        }
      }
    })
  },

  shouldRefetch: (filePath: string, thresholdMs = 30000) => {
    const entry = get().semanticCache[filePath]
    if (!entry) return true
    if (entry.isStale) return true
    const age = Date.now() - entry.lastFetched
    return age > (thresholdMs)
  },
}))
