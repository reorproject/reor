/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useDebounce } from 'use-debounce'
import { FileInfo, FileInfoTree } from 'electron/main/filesystem/types'
import {
  findRelevantDirectoriesToBeExpanded,
  flattenFileInfoTree,
  generateFileNameFromFileContent,
  getFilesInDirectory,
  getInvalidCharacterInFilePath,
  getNextAvailableFileNameGivenBaseName,
  sortFilesAndDirectories,
} from '@/lib/file'
import { SuggestionsState } from '@/components/Editor/BacklinkSuggestionsDisplay'
import { HighlightData } from '@/components/Editor/HighlightExtension'
import '@/styles/tiptap.scss'
import useOrderedSet from '../lib/hooks/use-ordered-set'
import welcomeNote from '@/lib/welcome-note'
import { useBlockNote, BlockNoteEditor } from '@/lib/blocknote'
import { hmBlockSchema } from '@/components/Editor/schema'
import { setGroupTypes } from '@/lib/utils'
import slashMenuItems from '../components/Editor/slash-menu-items'

type FileContextType = {
  vaultFilesTree: FileInfoTree
  vaultFilesFlattened: FileInfo[]
  expandedDirectories: Map<string, boolean>
  handleDirectoryToggle: (path: string) => void
  currentlyOpenFilePath: string | null
  setCurrentlyOpenFilePath: React.Dispatch<React.SetStateAction<string | null>>
  saveCurrentlyOpenedFile: () => Promise<void>
  editor: BlockNoteEditor | null
  navigationHistory: string[]
  addToNavigationHistory: (value: string) => void
  openOrCreateFile: (
    filePath: string,
    optionalContentToWriteOnCreate?: string,
    scrollToPosition?: number,
  ) => Promise<void>
  suggestionsState: SuggestionsState | null | undefined
  spellCheckEnabled: boolean
  highlightData: HighlightData
  noteToBeRenamed: string
  setNoteToBeRenamed: React.Dispatch<React.SetStateAction<string>>
  fileDirToBeRenamed: string
  setFileDirToBeRenamed: React.Dispatch<React.SetStateAction<string>>
  renameFile: (oldFilePath: string, newFilePath: string) => Promise<void>
  setSuggestionsState: React.Dispatch<React.SetStateAction<SuggestionsState | null | undefined>>
  setSpellCheckEnabled: React.Dispatch<React.SetStateAction<boolean>>
  deleteFile: (path: string | undefined) => Promise<boolean>
  selectedDirectory: string | null
  setSelectedDirectory: React.Dispatch<React.SetStateAction<string | null>>
}

export const FileContext = createContext<FileContextType | undefined>(undefined)

export const useFileContext = () => {
  const context = useContext(FileContext)
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider')
  }
  return context
}

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [vaultFilesTree, setVaultFilesTree] = useState<FileInfoTree>([])
  const [vaultFilesFlattened, setVaultFilesFlattened] = useState<FileInfo[]>([])
  const [expandedDirectories, setExpandedDirectories] = useState<Map<string, boolean>>(new Map())
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null)
  const [currentlyOpenFilePath, setCurrentlyOpenFilePath] = useState<string | null>(null)
  const [suggestionsState, setSuggestionsState] = useState<SuggestionsState | null>()
  const [needToWriteEditorContentToDisk, setNeedToWriteEditorContentToDisk] = useState<boolean>(false)
  const [needToIndexEditorContent, setNeedToIndexEditorContent] = useState<boolean>(false)
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(false)
  const [noteToBeRenamed, setNoteToBeRenamed] = useState<string>('')
  const [fileDirToBeRenamed, setFileDirToBeRenamed] = useState<string>('')
  const [currentlyChangingFilePath, setCurrentlyChangingFilePath] = useState(false)
  // TODO: Add highlighting data on search
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [highlightData, setHighlightData] = useState<HighlightData>({
    text: '',
    position: null,
  })

  const {
    add: addToNavigationHistory,
    remove: removeFromNavigationHistory,
    values: navigationHistory,
  } = useOrderedSet()

  useEffect(() => {
    const fetchSpellCheckMode = async () => {
      const storedSpellCheckEnabled = await window.electronStore.getSpellCheckMode()
      setSpellCheckEnabled(storedSpellCheckEnabled)
    }
    fetchSpellCheckMode()
  }, [spellCheckEnabled])

  const createFileIfNotExists = async (filePath: string, optionalContent?: string): Promise<string> => {
    const invalidChars = await getInvalidCharacterInFilePath(filePath)
    if (invalidChars) {
      const errorMessage = `Could not create note ${filePath}. Character ${invalidChars} cannot be included in note name.`
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
    const filePathWithExtension = await window.path.addExtensionIfNoExtensionPresent(filePath)
    const isAbsolutePath = await window.path.isAbsolute(filePathWithExtension)
    const absolutePath = isAbsolutePath
      ? filePathWithExtension
      : await window.path.join(await window.electronStore.getVaultDirectoryForWindow(), filePathWithExtension)

    const fileExists = await window.fileSystem.checkFileExists(absolutePath)
    if (!fileExists) {
      await window.fileSystem.createFile(absolutePath, optionalContent || ``)
      setNeedToIndexEditorContent(true)
    }

    return absolutePath
  }

  const loadFileIntoEditor = async (filePath: string, scrollToPosition?: number) => {
    console.log('[DEBUG-FC] Loading file into editor, with position:', scrollToPosition)
    setCurrentlyChangingFilePath(true)
    await writeEditorContentToDisk(editor, currentlyOpenFilePath)
    if (currentlyOpenFilePath && needToIndexEditorContent) {
      window.database.indexFileInDatabase(currentlyOpenFilePath)
      setNeedToIndexEditorContent(false)
    }
    const fileContent = (await window.fileSystem.readFile(filePath, 'utf-8')) ?? ''
    // editor?.commands.setContent(fileContent)
    const blocks = await editor.markdownToBlocks(fileContent)
    // @ts-expect-error
    editor.replaceBlocks(editor.topLevelBlocks, blocks)
    setGroupTypes(editor?._tiptapEditor, blocks)

    setCurrentlyOpenFilePath(filePath)
    setCurrentlyChangingFilePath(false)
    const parentDirectory = await window.path.dirname(filePath)
    setSelectedDirectory(parentDirectory)
    console.log('[DEBUG-FC] File loaded, position to scroll to:', scrollToPosition)

    // If a position is provided, scroll to it after loading the content
    if (scrollToPosition !== undefined && editor) {
      console.log('[DEBUG-FC] Setting up timeout for scrolling to position:', scrollToPosition)

      // Increased timeout to ensure document is fully rendered
      setTimeout(() => {
        console.log('[DEBUG-FC] Timeout triggered, attempting to scroll')
        // Find the block at this position
        if (editor._tiptapEditor && editor._tiptapEditor.view) {
          console.log('[DEBUG-FC] Editor and view are available')
          try {
            const docSize = editor._tiptapEditor.state.doc.content.size
            console.log('[DEBUG-FC] Document size:', docSize)

            // Add a small offset to get a bit further into the content
            // This helps with headings and position mismatches
            const position = Math.min(scrollToPosition + 15, docSize - 1)
            console.log('[DEBUG-FC] Using position with offset:', position)

            // Set the cursor position
            const success = editor._tiptapEditor.commands.setTextSelection(position)
            console.log('[DEBUG-FC] Set text selection success:', success)

            // Get the DOM node at that position and scroll to it
            const selectionAnchor = editor._tiptapEditor.state.selection.anchor
            console.log('[DEBUG-FC] Selection anchor:', selectionAnchor)

            const domAtPos = editor._tiptapEditor.view.domAtPos(selectionAnchor)
            console.log('[DEBUG-FC] DomAtPos result:', !!domAtPos)

            const { node } = domAtPos
            console.log('[DEBUG-FC] Node type:', node?.constructor?.name)

            // Try to find the parent block
            let targetNode = node
            let depth = 0
            const MAX_DEPTH = 5

            // Look for a better block element to scroll to
            while (targetNode && depth < MAX_DEPTH) {
              if (targetNode instanceof HTMLElement) {
                // Check if it's a good block element for scrolling
                const isBlock = window.getComputedStyle(targetNode).display === 'block'
                const hasGoodSize = targetNode.offsetHeight > 20

                if (isBlock && hasGoodSize) {
                  console.log('[DEBUG-FC] Found good block element to scroll to')
                  break
                }
              }

              targetNode = targetNode.parentElement
              depth++
            }

            // If we couldn't find a good block, use the original node
            if (!targetNode || depth >= MAX_DEPTH) {
              targetNode = node
            }

            if (targetNode instanceof HTMLElement) {
              console.log('[DEBUG-FC] Node is HTMLElement, scrolling into view with highlight')

              // First scroll to make sure the element is visible
              targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' })

              // Add a more prominent visual highlight that fades out
              const originalBackground = targetNode.style.backgroundColor
              const originalTransition = targetNode.style.transition

              // Create a temporary highlight effect
              targetNode.style.transition = 'background-color 2s ease-in-out'
              targetNode.style.backgroundColor = 'rgba(59, 130, 246, 0.3)' // Light blue highlight

              // Make the highlight persist longer, then fade out
              setTimeout(() => {
                targetNode.style.backgroundColor = originalBackground
                targetNode.style.transition = originalTransition
              }, 3000)

              console.log('[DEBUG-FC] Scroll into view called with highlight')
            } else if (node instanceof Element) {
              // Fallback for non-HTML elements
              console.log('[DEBUG-FC] Node is basic Element, performing simple scroll')
              node.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
              console.log('[DEBUG-FC] Node is not an Element:', node)
            }
          } catch (error) {
            console.error('[DEBUG-FC] Error during scrolling:', error)
          }
        } else {
          console.log('[DEBUG-FC] Editor or view not available:', {
            tiptapEditor: !!editor._tiptapEditor,
            view: !!(editor._tiptapEditor && editor._tiptapEditor.view),
          })
        }
      }, 800) // Increased delay to ensure the editor has finished rendering
    }
  }

  const openOrCreateFile = async (
    filePath: string,
    optionalContentToWriteOnCreate?: string,
    scrollToPosition?: number,
  ): Promise<void> => {
    const absolutePath = await createFileIfNotExists(filePath, optionalContentToWriteOnCreate)
    await loadFileIntoEditor(absolutePath, scrollToPosition)
  }

  const editor = useBlockNote<typeof hmBlockSchema>({
    onEditorContentChange() {
      setNeedToWriteEditorContentToDisk(true)
      setNeedToIndexEditorContent(true)
    },
    blockSchema: hmBlockSchema,
    slashMenuItems,
  })

  const [debouncedEditor] = useDebounce(editor?.topLevelBlocks, 3000)

  useEffect(() => {
    if (debouncedEditor && !currentlyChangingFilePath) {
      writeEditorContentToDisk(editor, currentlyOpenFilePath)
      if (editor && currentlyOpenFilePath) {
        handleNewFileRenaming(editor, currentlyOpenFilePath)
      }
    }
  }, [debouncedEditor, currentlyOpenFilePath, editor, currentlyChangingFilePath])

  const saveCurrentlyOpenedFile = async () => {
    await writeEditorContentToDisk(editor, currentlyOpenFilePath)
  }

  const writeEditorContentToDisk = async (_editor: BlockNoteEditor | null, filePath: string | null) => {
    if (filePath !== null && needToWriteEditorContentToDisk && _editor) {
      const blocks = _editor.topLevelBlocks
      const markdownContent = await _editor.blocksToMarkdown(blocks)
      if (markdownContent !== null) {
        await window.fileSystem.writeFile({
          filePath,
          content: markdownContent,
        })
        setNeedToWriteEditorContentToDisk(false)
      }
    }
  }

  const handleNewFileRenaming = async (_editor: BlockNoteEditor, filePath: string) => {
    const fileInfo = vaultFilesFlattened.find((f) => f.path === filePath)
    if (
      fileInfo &&
      fileInfo.name.startsWith('Untitled') &&
      new Date().getTime() - fileInfo.dateCreated.getTime() < 60000
    ) {
      // const editorText = _editor.getText()
      const editorText = await _editor.blocksToMarkdown(_editor.topLevelBlocks)
      if (editorText) {
        const newProposedFileName = generateFileNameFromFileContent(editorText)
        if (newProposedFileName) {
          const directoryToMakeFileIn = await window.path.dirname(filePath)
          const filesInDirectory = await getFilesInDirectory(directoryToMakeFileIn, vaultFilesFlattened)
          const fileName = getNextAvailableFileNameGivenBaseName(
            filesInDirectory.map((file) => file.name),
            newProposedFileName,
          )
          const newFilePath = await window.path.join(directoryToMakeFileIn, fileName)
          await renameFile(filePath, newFilePath)
          // setCurrentlyOpenFilePath(newFilePath)
        }
      }
    }
  }

  useEffect(() => {
    async function checkAppUsage() {
      if (!editor || currentlyOpenFilePath) return
      const hasOpened = await window.electronStore.getHasUserOpenedAppBefore()

      if (!hasOpened) {
        await window.electronStore.setHasUserOpenedAppBefore()
        openOrCreateFile('Welcome to Reor', welcomeNote)
      }
    }

    checkAppUsage()
  }, [editor, currentlyOpenFilePath])

  const renameFile = async (oldFilePath: string, newFilePath: string) => {
    await window.fileSystem.renameFile({
      oldFilePath,
      newFilePath,
    })
    removeFromNavigationHistory(oldFilePath)
    addToNavigationHistory(newFilePath)

    if (currentlyOpenFilePath === oldFilePath) {
      setCurrentlyOpenFilePath(newFilePath)
    }
  }

  useEffect(() => {
    const handleWindowClose = async () => {
      if (currentlyOpenFilePath !== null && editor && editor.topLevelBlocks !== null) {
        const blocks = editor.topLevelBlocks
        const markdownContent = await editor.blocksToMarkdown(blocks)
        await window.fileSystem.writeFile({
          filePath: currentlyOpenFilePath,
          content: markdownContent,
        })
        await window.database.indexFileInDatabase(currentlyOpenFilePath)
      }
    }

    const removeWindowCloseListener = window.ipcRenderer.receive('prepare-for-window-close', handleWindowClose)

    return () => {
      removeWindowCloseListener()
    }
  }, [currentlyOpenFilePath, editor])

  const deleteFile = async (path: string | undefined) => {
    if (!path) return false
    await window.fileSystem.deleteFile(path)
    if (currentlyOpenFilePath === path) {
      editor?.replaceBlocks(editor.topLevelBlocks, [])
      setCurrentlyOpenFilePath(null)
    }
    return true
  }

  const handleDirectoryToggle = (path: string) => {
    const isExpanded = expandedDirectories.get(path)
    const newExpandedDirectories = new Map(expandedDirectories)
    newExpandedDirectories.set(path, !isExpanded)
    setExpandedDirectories(newExpandedDirectories)
  }

  useEffect(() => {
    const handleFilesListUpdateFromMainProcess = async (updatedFiles: FileInfoTree) => {
      const sortedFiles = sortFilesAndDirectories(updatedFiles, null)
      setVaultFilesTree(sortedFiles)
      const updatedFlattenedFiles = flattenFileInfoTree(sortedFiles)
      setVaultFilesFlattened(updatedFlattenedFiles)
      const directoriesToBeExpanded = await findRelevantDirectoriesToBeExpanded(
        currentlyOpenFilePath,
        expandedDirectories,
      )
      setExpandedDirectories(directoriesToBeExpanded)
    }

    const removeFilesListListener = window.ipcRenderer.receive('files-list', handleFilesListUpdateFromMainProcess)

    return () => {
      removeFilesListListener()
    }
  }, [currentlyOpenFilePath, expandedDirectories])

  useEffect(() => {
    const fetchAndSetFiles = async () => {
      const fetchedFiles = await window.fileSystem.getFilesTreeForWindow()
      const sortedFiles = sortFilesAndDirectories(fetchedFiles, null)
      setVaultFilesTree(sortedFiles)
      const updatedFlattenedFiles = flattenFileInfoTree(sortedFiles)
      setVaultFilesFlattened(updatedFlattenedFiles)
    }

    fetchAndSetFiles()
  }, [])

  const contextValues = {
    vaultFilesTree,
    vaultFilesFlattened,
    expandedDirectories,
    handleDirectoryToggle,
    currentlyOpenFilePath,
    setCurrentlyOpenFilePath,
    saveCurrentlyOpenedFile,
    editor,
    navigationHistory,
    addToNavigationHistory,
    openOrCreateFile,
    suggestionsState,
    spellCheckEnabled,
    highlightData,
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile,
    setSuggestionsState,
    setSpellCheckEnabled,
    deleteFile,
    selectedDirectory,
    setSelectedDirectory,
  }

  const contextValuesMemo: FileContextType = React.useMemo(
    () => ({
      ...contextValues,
    }),
    [contextValues],
  )

  return <FileContext.Provider value={contextValuesMemo}>{children}</FileContext.Provider>
}
