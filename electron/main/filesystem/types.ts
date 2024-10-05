export type FileInfo = {
  name: string
  path: string
  relativePath: string
  dateModified: Date
  dateCreated: Date
}

export type FileInfoWithContent = FileInfo & {
  content: string
}

export type FileInfoNode = FileInfo & {
  children?: FileInfoNode[]
}

export type FileInfoTree = FileInfoNode[]

export interface AugmentPromptWithFileProps {
  prompt: string
  llmName: string
  filePath: string
}

export type WriteFileProps = {
  filePath: string
  content: string
}

export type RenameFileProps = {
  oldFilePath: string
  newFilePath: string
}
