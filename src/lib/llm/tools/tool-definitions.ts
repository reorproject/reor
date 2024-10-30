import { ToolDefinition } from '../types'
import { retreiveFromVectorDB } from '@/lib/db'

export const searchToolDefinition: ToolDefinition = {
  name: 'search',
  displayName: 'Search',
  description:
    'The search tool allows the LLM to automatically search your knowledge base. It is the most powerful tool because it can do things like filter by date & time which means you can ask things like "what did I work on last week?"',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'The query to search for. To get the best results, this should be the full user query.',
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 20,
      description: 'The number of results to return',
    },
    {
      name: 'minDate',
      type: 'string',
      optional: true,
      description: 'The minimum date of the notes to search for. Please use ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ',
    },
    {
      name: 'maxDate',
      type: 'string',
      optional: true,
      description: 'The maximum date of the notes to search for. Please use ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ',
    },
  ],
  autoExecute: true,
}

export const createNoteToolDefinition: ToolDefinition = {
  name: 'createNote',
  displayName: 'Create Note',
  description:
    'The create note tool allows the LLM to automatically create new notes for you. It will ask you to confirm before creating a new note.',
  parameters: [
    {
      name: 'filename',
      type: 'string',
      description: 'The filename of the note. Do not include the file extension.',
    },
    {
      name: 'content',
      type: 'string',
      description: 'The content of the note',
    },
  ],
}

export const createDirectoryToolDefinition: ToolDefinition = {
  name: 'createDirectory',
  displayName: 'Create Directory',
  description:
    'The create directory tool allows the LLM to automatically create new directories for you. It will ask you to confirm before creating a new directory.',
  parameters: [
    {
      name: 'directoryName',
      type: 'string',
      description: 'The name of the directory to create',
    },
  ],
}

const readFileToolDefinition: ToolDefinition = {
  name: 'readFile',
  displayName: 'Read File',
  description:
    'The read file tool allows the LLM to automatically read files from your knowledge base. It will ask you to confirm before reading a file.',
  parameters: [
    {
      name: 'filePath',
      type: 'string',
      description: 'The path of the file to read',
    },
  ],
}

export const deleteNoteToolDefinition: ToolDefinition = {
  name: 'deleteNote',
  displayName: 'Delete Note',
  description:
    'The delete note tool allows the LLM to automatically delete notes from your knowledge base. It will ask you to confirm before deleting a note.',
  parameters: [
    {
      name: 'filename',
      type: 'string',
      description: 'The filename of the note to delete',
    },
  ],
}

export const editNoteToolDefinition: ToolDefinition = {
  name: 'editNote',
  displayName: 'Edit Note',
  description:
    'The edit note tool allows the LLM to automatically edit notes in your knowledge base. It will ask you to confirm before editing a note.',
  parameters: [
    {
      name: 'filename',
      type: 'string',
      description: 'The filename of the note to edit',
    },
    {
      name: 'content',
      type: 'string',
      description: 'The content to edit the note to',
    },
  ],
}

export const appendToNoteToolDefinition: ToolDefinition = {
  name: 'appendToNote',
  displayName: 'Append to Note',
  description:
    'The append to note tool allows the LLM to automatically append to notes in your knowledge base. It will ask you to confirm before appending to a note.',
  parameters: [
    {
      name: 'filename',
      type: 'string',
      description: 'The filename of the note to append to',
    },
    {
      name: 'content',
      type: 'string',
      description: 'The content to append to the note',
    },
  ],
}

export const listFilesToolDefinition: ToolDefinition = {
  name: 'listFiles',
  displayName: 'List Files',
  description: 'The list files tool allows the LLM to automatically list files from your knowledge base.',
  parameters: [],
}

export const allAvailableToolDefinitions: ToolDefinition[] = [
  searchToolDefinition,
  createNoteToolDefinition,
  createDirectoryToolDefinition,
  readFileToolDefinition,
  deleteNoteToolDefinition,
  appendToNoteToolDefinition,
  editNoteToolDefinition,
  listFilesToolDefinition,
]

type ToolFunction = (...args: any[]) => Promise<any>

type ToolFunctionMap = {
  [key: string]: ToolFunction
}

export const toolNamesToFunctions: ToolFunctionMap = {
  search: async (query: string, limit: number, minDate: Date, maxDate: Date): Promise<any[]> => {
    const results = await retreiveFromVectorDB(query, { limit, minDate, maxDate, passFullNoteIntoContext: true })
    return results
  },
  createNote: async (filename: string, content: string): Promise<string> => {
    const vault = await window.electronStore.getVaultDirectoryForWindow()
    const path = await window.path.join(vault, filename)
    await window.fileSystem.createFile(path, content)
    return `Note ${path} created successfully`
  },
  createDirectory: async (directoryName: string): Promise<string> => {
    const vault = await window.electronStore.getVaultDirectoryForWindow()
    const path = await window.path.join(vault, directoryName)
    await window.fileSystem.createDirectory(path)
    return `Directory ${directoryName} created successfully`
  },
  readFile: async (filePath: string): Promise<string> => {
    const content = await window.fileSystem.readFile(filePath)
    return content
  },
  deleteNote: async (filename: string): Promise<string> => {
    const vault = await window.electronStore.getVaultDirectoryForWindow()
    const path = await window.path.join(vault, filename)
    await window.fileSystem.deleteFile(path)
    return `Note ${filename} deleted successfully`
  },
  editNote: async (filename: string, content: string): Promise<string> => {
    const vault = await window.electronStore.getVaultDirectoryForWindow()
    const path = await window.path.join(vault, filename)
    await window.fileSystem.writeFile({ filePath: path, content })
    return `Note ${filename} edited successfully`
  },
  appendToNote: async (filename: string, content: string): Promise<string> => {
    const vault = await window.electronStore.getVaultDirectoryForWindow()
    const path = await window.path.join(vault, filename)
    const currentContent = await window.fileSystem.readFile(path)
    await window.fileSystem.writeFile({ filePath: path, content: currentContent + content })
    return `Note ${filename} appended to successfully`
  },
  listFiles: async (): Promise<string[]> => {
    const files = await window.fileSystem.getFilesTreeForWindow()
    // convert to string
    return files.map((file) => file.name)
  },
}

export type ToolName = keyof typeof toolNamesToFunctions
