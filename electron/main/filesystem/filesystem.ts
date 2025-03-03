import * as fs from 'fs'
import * as path from 'path'

import chokidar from 'chokidar'
import { BrowserWindow } from 'electron'

import Store from 'electron-store'
import { FileInfo, FileInfoTree } from './types'
import addExtensionToFilenameIfNoExtensionPresent from '../path/path'
import { isFileNodeDirectory } from '../../../shared/utils'
import { StoreSchema, StoreKeys } from '../electron-store/storeConfig'

export const markdownExtensions = ['.md', '.markdown', '.mdown', '.mkdn', '.mkd']

export function isHidden(fileName: string): boolean {
  return fileName.startsWith('.')
}

function fileHasExtensionInList(filePath: string, extensions: string[]): boolean {
  try {
    const fileExtension = path.extname(filePath).toLowerCase()
    return extensions.includes(fileExtension)
  } catch (error) {
    return false
  }
}

export function GetFilesInfoTree(pathInput: string, parentRelativePath: string = ''): FileInfoTree {
  const fileInfoTree: FileInfoTree = []

  if (!fs.existsSync(pathInput)) {
    return fileInfoTree
  }

  try {
    const stats = fs.statSync(pathInput)
    if (stats.isFile()) {
      if (fileHasExtensionInList(pathInput, markdownExtensions) && !isHidden(path.basename(pathInput))) {
        fileInfoTree.push({
          name: path.basename(pathInput),
          path: pathInput,
          relativePath: parentRelativePath,
          dateModified: stats.mtime,
          dateCreated: stats.birthtime, // Add the birthtime property here
        })
      }
    } else {
      const itemsInDir = fs.readdirSync(pathInput).filter((item) => !isHidden(item))

      const childNodes: FileInfoTree = itemsInDir
        .map((item) => {
          const itemPath = path.join(pathInput, item)
          return GetFilesInfoTree(itemPath, path.join(parentRelativePath, item))
        })
        .flat()

      if (parentRelativePath === '') {
        return childNodes
      }
      if (!isHidden(path.basename(pathInput))) {
        fileInfoTree.push({
          name: path.basename(pathInput),
          path: pathInput,
          relativePath: parentRelativePath,
          dateModified: stats.mtime,
          dateCreated: stats.birthtime,
          children: childNodes,
        })
      }
    }
  } catch (error) {
    // no need to throw error
  }

  return fileInfoTree
}

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

export function GetFilesInfoList(directory: string): FileInfo[] {
  const fileInfoTree = GetFilesInfoTree(directory)
  const fileInfoList = flattenFileInfoTree(fileInfoTree)
  return fileInfoList
}

export function GetFilesInfoListForListOfPaths(paths: string[]): FileInfo[] {
  const fileInfoTree = paths.map((_path) => GetFilesInfoTree(_path)).flat()
  const fileInfoList = flattenFileInfoTree(fileInfoTree)

  const uniquePaths = new Set()
  const fileInfoListWithoutDuplicates = fileInfoList.filter((fileInfo) => {
    if (uniquePaths.has(fileInfo.path)) {
      return false
    }
    uniquePaths.add(fileInfo.path)
    return true
  })
  return fileInfoListWithoutDuplicates
}

export function createFileRecursive(filePath: string, content: string, charset?: BufferEncoding): void {
  const dirname = path.dirname(filePath)

  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true })
  }

  if (fs.existsSync(filePath)) {
    return
  }
  const filePathWithExtension = addExtensionToFilenameIfNoExtensionPresent(filePath, markdownExtensions, '.md')

  fs.writeFileSync(filePathWithExtension, content, charset)
}

export function updateFileListForRenderer(win: BrowserWindow, directory: string): void {
  const files = GetFilesInfoTree(directory)
  if (win) {
    win.webContents.send('files-list', files)
  }
}

export function startWatchingDirectory(win: BrowserWindow, directoryToWatch: string): chokidar.FSWatcher | undefined {
  try {
    const watcher = chokidar.watch(directoryToWatch, {
      ignoreInitial: true,
    })

    const handleFileEvent = (eventType: string, filePath: string) => {
      if (fileHasExtensionInList(filePath, markdownExtensions) || eventType.includes('directory')) {
        // TODO: add logic to update vector db
        updateFileListForRenderer(win, directoryToWatch)
      }
    }

    watcher
      .on('add', (_path) => handleFileEvent('added', _path))
      .on('change', (_path) => handleFileEvent('changed', _path))
      .on('unlink', (_path) => handleFileEvent('removed', _path))
      .on('addDir', (_path) => handleFileEvent('directory added', _path))
      .on('unlinkDir', (_path) => handleFileEvent('directory removed', _path))

    // No 'ready' event handler is needed here, as we're ignoring initial scan
    return watcher
  } catch (error) {
    // no error
    return undefined
  }
}

export function appendExtensionIfMissing(filename: string, extensions: string[]): string {
  const hasExtension = extensions.some((ext) => filename.endsWith(ext))

  if (hasExtension) {
    return filename
  }

  return filename + extensions[0]
}

export function readFile(filePath: string): string {
  const data = fs.readFileSync(filePath, 'utf8')
  return data
}

export function splitDirectoryPathIntoBaseAndRepo(fullPath: string) {
  const normalizedPath = path.normalize(fullPath)

  const pathWithSeparator = normalizedPath.endsWith(path.sep) ? normalizedPath : `${normalizedPath}${path.sep}`

  if (path.dirname(pathWithSeparator.slice(0, -1)) === pathWithSeparator.slice(0, -1)) {
    return {
      localModelPath: '', // No directory path before the root
      repoName: path.basename(pathWithSeparator.slice(0, -1)), // Root directory name
    }
  }

  const localModelPath = path.dirname(pathWithSeparator.slice(0, -1))
  const repoName = path.basename(pathWithSeparator.slice(0, -1))

  return { localModelPath, repoName }
}

interface FileSearchResult {
  absolutePath: string
  relativePath: string
}

export const searchFiles = async (store: Store<StoreSchema>, searchTerm: string): Promise<FileSearchResult[]> => {
  const vaultDirectory = store.get(StoreKeys.DirectoryFromPreviousSession)
  if (!vaultDirectory || typeof vaultDirectory !== 'string') {
    throw new Error('No valid vault directory found')
  }

  const allFiles = GetFilesInfoList(vaultDirectory)
  const searchTermLower = searchTerm.toLowerCase()

  const matchingFiles = allFiles
    .filter((file) => file.name.toLowerCase().startsWith(searchTermLower))
    .map((file) => ({
      absolutePath: file.path,
      relativePath: file.path.replace(vaultDirectory, '').replace(/^[/\\]+/, ''),
    }))

  return matchingFiles
}

export const getVaultPath = (store: Store<StoreSchema>): string => {
  const vaultDirectory = store.get(StoreKeys.DirectoryFromPreviousSession)
  if (!vaultDirectory || typeof vaultDirectory !== 'string') {
    throw new Error('No valid vault directory found')
  }
  return vaultDirectory
}
