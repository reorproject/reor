// import { useEffect, useState } from 'react'

// import { FileInfo, FileInfoTree } from 'electron/main/filesystem/types'

// import flattenFileInfoTree, { sortFilesAndDirectories } from '../utils'

// const useFileInfoTreeHook = (filePath: string | null) => {
//   const [fileInfoTree, setFileInfoTree] = useState<FileInfoTree>([])
//   const [flattenedFiles, setFlattenedFiles] = useState<FileInfo[]>([])
//   const [expandedDirectories, setExpandedDirectories] = useState<Map<string, boolean>>(new Map())

//   const handleDirectoryToggle = (path: string) => {
//     const isExpanded = expandedDirectories.get(path)
//     const newExpandedDirectories = new Map(expandedDirectories)
//     newExpandedDirectories.set(path, !isExpanded)
//     setExpandedDirectories(newExpandedDirectories)
//   }

//   // upon indexing, update the file info tree and expand relevant directories
//   useEffect(() => {
//     const findRelevantDirectoriesToBeOpened = async () => {
//       if (filePath === null) {
//         return expandedDirectories
//       }

//       const pathSep = await window.path.pathSep()
//       const isAbsolute = await window.path.isAbsolute(filePath)

//       const currentPath = isAbsolute ? '' : '.'
//       const newExpandedDirectories = new Map(expandedDirectories)

//       const pathSegments = filePath.split(pathSep).filter((segment) => segment !== '')

//       pathSegments.pop()

//       const updatedPath = pathSegments.reduce(async (pathPromise, segment) => {
//         const path = await pathPromise
//         const newPath = await window.path.join(path, segment)
//         newExpandedDirectories.set(newPath, true)
//         return newPath
//       }, Promise.resolve(currentPath))

//       await updatedPath

//       return newExpandedDirectories
//     }

//     const handleFileUpdate = async (updatedFiles: FileInfoTree) => {
//       const sortedFiles = sortFilesAndDirectories(updatedFiles, null)
//       setFileInfoTree(sortedFiles)
//       const updatedFlattenedFiles = flattenFileInfoTree(sortedFiles)
//       setFlattenedFiles(updatedFlattenedFiles)
//       const directoriesToBeExpanded = await findRelevantDirectoriesToBeOpened()
//       setExpandedDirectories(directoriesToBeExpanded)
//     }

//     const removeFilesListListener = window.ipcRenderer.receive('files-list', handleFileUpdate)

//     return () => {
//       removeFilesListListener()
//     }
//   }, [filePath, expandedDirectories])

//   // initial load of files
//   useEffect(() => {
//     const fetchAndSetFiles = async () => {
//       const fetchedFiles = await window.fileSystem.getFilesTreeForWindow()
//       const sortedFiles = sortFilesAndDirectories(fetchedFiles, null)
//       setFileInfoTree(sortedFiles)
//       const updatedFlattenedFiles = flattenFileInfoTree(sortedFiles)
//       setFlattenedFiles(updatedFlattenedFiles)
//     }

//     fetchAndSetFiles()
//   }, [])

//   return {
//     files: fileInfoTree,
//     flattenedFiles,
//     expandedDirectories,
//     handleDirectoryToggle,
//   }
// }

// export default useFileInfoTreeHook
