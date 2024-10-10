import { isFileNodeDirectory } from '@shared/utils'
import { FileInfo, FileInfoTree } from 'electron/main/filesystem/types'
import slugify from 'slugify'

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

// so we just want to remove

// eslint-disable-next-line no-useless-escape
const INVALID_FILENAME_CHARACTERS = /[<>:"\/\\|?*\.\[\]\{\}!@#$%^&()+=,;'`~]/

export const getInvalidCharacterInFileName = (filename: string): string | null => {
  // Check if the filename contains any invalid characters
  const match = filename.match(INVALID_FILENAME_CHARACTERS)
  return match ? match[0] : null
}

export const removeInvalidCharactersFromFileName = (filename: string): string => {
  return filename.replace(INVALID_FILENAME_CHARACTERS, '')
}

export const generateFileNameFromFileContent = (content: string, maxLength: number = 30): string | null => {
  // Split the content into lines and get the first non-empty line
  const firstLine = content.split('\n').find((line) => line.trim() !== '')

  // If there's no content, return null
  if (!firstLine) {
    return null
  }

  // Extract potential title from markdown heading
  const titleMatch = firstLine.match(/^#+\s*(.+)/)
  const potentialTitle = titleMatch ? titleMatch[1] : firstLine

  // Remove invalid characters before slugify
  const cleanTitle = removeInvalidCharactersFromFileName(potentialTitle)

  // Use slugify to generate a clean, URL-friendly slug
  const slug = slugify(cleanTitle, {
    lower: true, // convert to lower case
    strict: true, // strip special characters except replacement
    trim: true, // trim leading and trailing replacement chars
  })

  // Truncate the slug if it's longer than maxLength
  const truncatedSlug = slug.substring(0, maxLength)

  // If the slug is empty after all processing, return null
  if (!truncatedSlug) {
    return null
  }

  return `${truncatedSlug}`
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
