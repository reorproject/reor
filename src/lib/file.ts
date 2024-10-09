import { isFileNodeDirectory } from '@shared/utils'
import { FileInfo, FileInfoTree } from 'electron/main/filesystem/types'

export function flattenFileInfoTree(tree: FileInfoTree): FileInfo[] {
  return tree.reduce((flatList: FileInfo[], node) => {
    if (!isFileNodeDirectory(node)) {
      flatList.push({
        name: node.name,
        path: node.path,
        relativePath: node.relativePath,
        dateModified: node.dateModified,
        dateCreated: node.dateCreated,
      })
    }
    if (isFileNodeDirectory(node) && node.children) {
      flatList.push(...flattenFileInfoTree(node.children))
    }
    return flatList
  }, [])
}

export const moveFile = async (sourcePath: string, destinationPath: string) => {
  await window.fileSystem.moveFileOrDir(sourcePath, destinationPath)
}

export const getFilesInDirectory = async (directoryPath: string, filesTree: FileInfo[]): Promise<FileInfo[]> => {
  return filesTree.filter((file) => file.path.startsWith(directoryPath))
}

export function getNextUntitledFilename(existingFilenames: string[]): string {
  const untitledRegex = /^Untitled (\d+)\.md$/

  const existingNumbers = existingFilenames
    .filter((filename) => untitledRegex.test(filename))
    .map((filename) => {
      const match = filename.match(untitledRegex)
      return match ? parseInt(match[1], 10) : 0
    })

  const maxNumber = Math.max(0, ...existingNumbers)

  return `Untitled ${maxNumber + 1}.md`
}

export function removeFileExtension(filename: string): string {
  if (!filename || filename.indexOf('.') === -1) {
    return filename
  }

  if (filename.startsWith('.') && filename.lastIndexOf('.') === 0) {
    return filename
  }

  return filename.substring(0, filename.lastIndexOf('.'))
}

export const getInvalidCharacterInFilePath = async (filename: string): Promise<string | null> => {
  let invalidCharacters: RegExp
  const platform = await window.electronUtils.getPlatform()

  switch (platform) {
    case 'win32':
      invalidCharacters = /["*<>?|]/
      break
    case 'darwin':
      invalidCharacters = /[:]/
      break
    default:
      invalidCharacters = /$^/
      break
  }

  const idx = filename.search(invalidCharacters)

  return idx === -1 ? null : filename[idx]
}

export const getInvalidCharacterInFileName = async (filename: string): Promise<string | null> => {
  // eslint-disable-next-line no-useless-escape
  const invalidCharacters = /[<>:"\/\\|?*\.\[\]\{\}!@#$%^&()+=,;'`~]/

  // Check if the filename contains any invalid characters
  const match = filename.match(invalidCharacters)
  return match ? match[0] : null
}

export const generateFileName = (filename: string): string => {
  return `${filename
    .split('\n')[0]
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .substring(0, 20)}.md`
}

export const sortFilesAndDirectories = (fileList: FileInfoTree, currentFilePath: string | null): FileInfoTree => {
  fileList.sort((a, b) => {
    const aIsDirectory = isFileNodeDirectory(a)
    const bIsDirectory = isFileNodeDirectory(b)

    if (aIsDirectory && bIsDirectory) {
      return a.name.localeCompare(b.name)
    }

    if (aIsDirectory && !bIsDirectory) {
      return -1
    }
    if (!aIsDirectory && bIsDirectory) {
      return 1
    }

    if (currentFilePath !== null) {
      if (a.path === currentFilePath) {
        return -1
      }
      if (b.path === currentFilePath) {
        return 1
      }
    }

    return b.dateModified.getTime() - a.dateModified.getTime()
  })

  fileList.forEach((fileInfoNode) => {
    if (fileInfoNode.children && fileInfoNode.children.length > 0) {
      sortFilesAndDirectories(fileInfoNode.children, currentFilePath)
    }
  })

  return fileList
}
