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
  isFetching: boolean
}

type SemanticCacheState = {
  semanticCache: Record<string, SemanticEntry>
  getSemanticData: (filePath: string) => SemanticEntry
  setSemanticData: (filePath: string, data: DBQueryResult[]) => void
  markStale: (filePath: string) => void
  shouldRefetch: (filePath: string, thresholdMs?: number) => boolean
  setFetching: (filePath: string, isFetching: boolean) => void
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
          isFetching: false,
        },
      },
    }))
  },

  getSemanticData: (filePath: string) => {
    return get().semanticCache[filePath] ?? { data: [], lastFetched: 0, isStale: true, isFetching: false }
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
          },
        },
      }
    })
  },

  setFetching: (filePath: string, isFetching: boolean) => {
    set((state) => {
      const entry = state.semanticCache[filePath]
      if (!entry) return {}
      return {
        semanticCache: {
          ...state.semanticCache,
          [filePath]: {
            ...entry,
            isFetching,
          },
        },
      }
    })
  },

  shouldRefetch: (filePath: string, thresholdMs = 30000) => {
    const entry = get().semanticCache[filePath]
    if (!entry) return true
    if (entry.isStale) return true
    const age = Date.now() - entry.lastFetched
    return age > thresholdMs
  },
}))
