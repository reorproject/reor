import { useEffect, useState } from 'react'

import { FileInfo, FileInfoTree } from 'electron/main/filesystem/types'

import flattenFileInfoTree, { sortFilesAndDirectories } from '../utils'

const useFileInfoTree = (currentFilePath: string | null) => {
  const [fileInfoTree, setFileInfoTree] = useState<FileInfoTree>([])
  const [flattenedFiles, setFlattenedFiles] = useState<FileInfo[]>([])
  const [expandedDirectories, setExpandedDirectories] = useState<Map<string, boolean>>(new Map())

  // find relevant directories that are opened, progressively building for each directory but removing last line

  const handleDirectoryToggle = (path: string) => {
    const isExpanded = expandedDirectories.get(path)
    const newExpandedDirectories = new Map(expandedDirectories)
    newExpandedDirectories.set(path, !isExpanded)
    setExpandedDirectories(newExpandedDirectories)
  }

  // upon indexing, update the file info tree and expand relevant directories
  useEffect(() => {
    const findRelevantDirectoriesToBeOpened = () => {
      if (currentFilePath === null) {
        return expandedDirectories
      }
      const pathSegments = currentFilePath.split('/').filter((segment) => segment !== '')
      pathSegments.pop() // Remove the file name from the path

      let currentPath = ''
      const newExpandedDirectories = new Map(expandedDirectories)
      pathSegments.forEach((segment) => {
        currentPath += `/${segment}`
        newExpandedDirectories.set(currentPath, true)
      })

      return newExpandedDirectories
    }

    const handleFileUpdate = (updatedFiles: FileInfoTree) => {
      const sortedFiles = sortFilesAndDirectories(updatedFiles, null)
      setFileInfoTree(sortedFiles)
      const updatedFlattenedFiles = flattenFileInfoTree(sortedFiles)
      setFlattenedFiles(updatedFlattenedFiles)
      const directoriesToBeExpanded = findRelevantDirectoriesToBeOpened()
      setExpandedDirectories(directoriesToBeExpanded)
    }

    const removeFilesListListener = window.ipcRenderer.receive('files-list', handleFileUpdate)

    return () => {
      removeFilesListListener()
    }
  }, [currentFilePath, expandedDirectories])

  // initial load of files
  useEffect(() => {
    const fetchAndSetFiles = async () => {
      try {
        const fetchedFiles = await window.fileSystem.getFilesTreeForWindow()
        const sortedFiles = sortFilesAndDirectories(fetchedFiles, null)
        setFileInfoTree(sortedFiles)
        const updatedFlattenedFiles = flattenFileInfoTree(sortedFiles)
        setFlattenedFiles(updatedFlattenedFiles)
      } catch (error) {
        // no need to do anything
      }
    }

    fetchAndSetFiles()
  }, [])

  return {
    files: fileInfoTree,
    flattenedFiles,
    expandedDirectories,
    handleDirectoryToggle,
  }
}

export default useFileInfoTree
