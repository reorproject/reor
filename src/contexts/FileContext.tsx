/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { MathExtension } from '@aarkue/tiptap-math-extension'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Text from '@tiptap/extension-text'
import TextStyle from '@tiptap/extension-text-style'
import { Editor, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CharacterCount from '@tiptap/extension-character-count'
import { toast } from 'react-toastify'
import { Markdown } from 'tiptap-markdown'
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
import HighlightExtension, { HighlightData } from '@/components/Editor/HighlightExtension'
import { RichTextLink } from '@/components/Editor/RichTextLink'
import '@/styles/tiptap.scss'
import SearchAndReplace from '@/components/Editor/Search/SearchAndReplaceExtension'
import getMarkdown from '@/components/Editor/utils'
import useOrderedSet from '../lib/hooks/use-ordered-set'
import welcomeNote from '@/lib/welcome-note'

type FileContextType = {
  vaultFilesTree: FileInfoTree
  vaultFilesFlattened: FileInfo[]
  expandedDirectories: Map<string, boolean>
  handleDirectoryToggle: (path: string) => void
  currentlyOpenFilePath: string | null
  setCurrentlyOpenFilePath: React.Dispatch<React.SetStateAction<string | null>>
  saveCurrentlyOpenedFile: () => Promise<void>
  editor: Editor | null
  navigationHistory: string[]
  addToNavigationHistory: (value: string) => void
  openOrCreateFile: (filePath: string, optionalContentToWriteOnCreate?: string) => Promise<void>
  spellCheckEnabled: boolean
  highlightData: HighlightData
  noteToBeRenamed: string
  setNoteToBeRenamed: React.Dispatch<React.SetStateAction<string>>
  fileDirToBeRenamed: string
  setFileDirToBeRenamed: React.Dispatch<React.SetStateAction<string>>
  renameFile: (oldFilePath: string, newFilePath: string) => Promise<void>
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
  const [needToWriteEditorContentToDisk, setNeedToWriteEditorContentToDisk] = useState<boolean>(false)
  const [needToIndexEditorContent, setNeedToIndexEditorContent] = useState<boolean>(false)
  const [spellCheckEnabled, setSpellCheckEnabled] = useState<boolean>(false)
  const [noteToBeRenamed, setNoteToBeRenamed] = useState<string>('')
  const [fileDirToBeRenamed, setFileDirToBeRenamed] = useState<string>('')
  const [currentlyChangingFilePath, setCurrentlyChangingFilePath] = useState(false)
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

  const loadFileIntoEditor = async (filePath: string) => {
    setCurrentlyChangingFilePath(true)
    await writeEditorContentToDisk(editor, currentlyOpenFilePath)
    if (currentlyOpenFilePath && needToIndexEditorContent) {
      window.database.indexFileInDatabase(currentlyOpenFilePath)
      setNeedToIndexEditorContent(false)
    }
    const fileContent = (await window.fileSystem.readFile(filePath)) ?? ''
    editor?.commands.setContent(fileContent)
    setCurrentlyOpenFilePath(filePath)
    setCurrentlyChangingFilePath(false)
    const parentDirectory = await window.path.dirname(filePath)
    setSelectedDirectory(parentDirectory)
  }

  const openOrCreateFile = async (filePath: string, optionalContentToWriteOnCreate?: string): Promise<void> => {
    const absolutePath = await createFileIfNotExists(filePath, optionalContentToWriteOnCreate)
    await loadFileIntoEditor(absolutePath)
  }

  const editor = useEditor({
    autofocus: true,
    onUpdate() {
      setNeedToWriteEditorContentToDisk(true)
      setNeedToIndexEditorContent(true)
    },
    editorProps: {},
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      TaskList,
      MathExtension.configure({
        evaluation: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      SearchAndReplace.configure({
        searchResultClass: 'bg-yellow-400',
        disableRegex: false,
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
        transformPastedText: true,
        transformCopiedText: false,
      }),
      TaskItem.configure({
        nested: true,
      }),
      HighlightExtension(setHighlightData),
      RichTextLink.configure({
        linkOnPaste: true,
        openOnClick: true,
      }),
      CharacterCount,
    ],
  })

  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            spellcheck: spellCheckEnabled.toString(),
          },
        },
      })
    }
  }, [spellCheckEnabled, editor])

  const [debouncedEditor] = useDebounce(editor?.state.doc.content, 3000)

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

  const writeEditorContentToDisk = async (_editor: Editor | null, filePath: string | null) => {
    if (filePath !== null && needToWriteEditorContentToDisk && _editor) {
      const markdownContent = getMarkdown(_editor)
      if (markdownContent !== null) {
        await window.fileSystem.writeFile({
          filePath,
          content: markdownContent,
        })
        setNeedToWriteEditorContentToDisk(false)
      }
    }
  }

  const handleNewFileRenaming = async (_editor: Editor, filePath: string) => {
    const fileInfo = vaultFilesFlattened.find((f) => f.path === filePath)
    if (
      fileInfo &&
      fileInfo.name.startsWith('Untitled') &&
      new Date().getTime() - fileInfo.dateCreated.getTime() < 60000
    ) {
      const editorText = _editor.getText()
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
      if (currentlyOpenFilePath !== null && editor && editor.getHTML() !== null) {
        const markdown = getMarkdown(editor)
        await window.fileSystem.writeFile({
          filePath: currentlyOpenFilePath,
          content: markdown,
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
      editor?.commands.setContent('')
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
    spellCheckEnabled,
    highlightData,
    noteToBeRenamed,
    setNoteToBeRenamed,
    fileDirToBeRenamed,
    setFileDirToBeRenamed,
    renameFile,
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
