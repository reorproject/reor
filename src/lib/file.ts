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

export const getFilesInDirectory = async (directoryPath: string, filesTree: FileInfo[]): Promise<FileInfo[]> => {
  return filesTree.filter((file) => file.path.startsWith(directoryPath))
}

export function getNextAvailableFileNameGivenBaseName(
  existingFilenames: string[],
  baseName: string,
  extension: string = 'md',
): string {
  const filenameRegex = new RegExp(`^${baseName}( \\d+)?\\.${extension}$`)

  const existingNumbers = existingFilenames
    .filter((filename) => filenameRegex.test(filename))
    .map((filename) => {
      const match = filename.match(filenameRegex)
      return match && match[1] ? parseInt(match[1].trim(), 10) : 0
    })

  if (existingNumbers.length === 0) {
    return `${baseName}.${extension}`
  }

  const maxNumber = Math.max(...existingNumbers)

  return `${baseName} ${maxNumber + 1}.${extension}`
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

export const getInvalidCharacterInFilePath = async (filePath: string): Promise<string | null> => {
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

  const idx = filePath.search(invalidCharacters)

  return idx === -1 ? null : filePath[idx]
}

// eslint-disable-next-line no-useless-escape
const INVALID_FILENAME_CHARACTERS = /[<>:"\/\\|?*\.\[\]\{\}!@#$%^&()+=,;'`~]/g

export const getInvalidCharacterInFileName = (filename: string): string | null => {
  // Check if the filename contains any invalid characters
  const match = filename.match(INVALID_FILENAME_CHARACTERS)
  return match ? match[0] : null
}

export const removeInvalidCharactersFromFileName = (filename: string): string => {
  return filename.replace(INVALID_FILENAME_CHARACTERS, '')
}

export const generateFileNameFromFileContent = (content: string, maxLength: number = 30): string | null => {
  const firstLine = content.split('\n').find((line) => line.trim() !== '')
  if (!firstLine) {
    return null
  }
  const cleanTitle = removeInvalidCharactersFromFileName(firstLine.trim())
  const words = cleanTitle.split(/\s+/)

  const { resultString: finalResult } = words.reduce(
    ({ resultString, currentLength }, word) => {
      if (currentLength + word.length + (resultString ? 1 : 0) <= maxLength) {
        return {
          resultString: resultString + (resultString ? ' ' : '') + word,
          currentLength: currentLength + word.length + (resultString ? 1 : 0),
        }
      }
      return { resultString, currentLength }
    },
    { resultString: '', currentLength: 0 },
  )

  if (!finalResult) {
    // Edge case: first word is longer than maxLength
    return words[0] ? words[0].substring(0, maxLength) : null
  }

  return finalResult
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

export const findRelevantDirectoriesToBeExpanded = async (
  filePath: string | null,
  currentExpandedDirs: Map<string, boolean>,
) => {
  if (!filePath) {
    return currentExpandedDirs
  }

  const pathSep = await window.path.pathSep()
  const isAbsolute = await window.path.isAbsolute(filePath)
  const basePath = isAbsolute ? '' : '.'

  const directoryPath = await window.path.dirname(filePath)
  const pathSegments = directoryPath.split(pathSep).filter(Boolean)

  const newExpandedDirectories = new Map(currentExpandedDirs)
  let currentPath = basePath

  for (const segment of pathSegments) {
    // eslint-disable-next-line no-await-in-loop
    currentPath = await window.path.join(currentPath, segment)
    newExpandedDirectories.set(currentPath, true)
  }

  return newExpandedDirectories
}
