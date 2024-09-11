import { ToolResultPart } from 'ai'
import { ToolConfig } from './types'

export const searchTool: ToolConfig = {
  name: 'search',
  description: "Semantically search the user's personal knowledge base",
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'The query to search for',
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 10,
      description: 'The number of results to return',
    },
  ],
}

export const createNoteTool: ToolConfig = {
  name: 'createNote',
  description: "Create a new note in the user's personal knowledge base",
  parameters: [
    {
      name: 'filename',
      type: 'string',
      description: 'The filename of the note',
    },
    {
      name: 'content',
      type: 'string',
      description: 'The content of the note',
    },
  ],
}

type ToolFunction = (...args: any[]) => Promise<any>

type ToolFunctionMap = {
  [key: string]: ToolFunction
}

export const toolNamesToFunctions: ToolFunctionMap = {
  search: async (query: string, limit: number): Promise<any[]> => {
    const results = await window.database.search(query, limit)
    return results
  },
  createNote: async (filename: string, content: string): Promise<string> => {
    const vault = await window.electronStore.getVaultDirectoryForWindow()
    const path = await window.path.join(vault, filename)
    await window.fileSystem.createFile(path, content)
    return `Note ${filename} created successfully`
  },
}

type ToolName = keyof typeof toolNamesToFunctions

export async function executeTool(toolName: ToolName, args: unknown[]): Promise<any> {
  const tool = toolNamesToFunctions[toolName]
  if (!tool) {
    throw new Error(`Unknown tool: ${toolName}`)
  }
  const out = await tool(...Object.values(args)) // TODO: make this better quizas.
  return out
}

export async function createToolResult(toolName: string, args: unknown[], toolCallId: string): Promise<ToolResultPart> {
  try {
    const result = await executeTool(toolName, args)
    return {
      type: 'tool-result',
      toolCallId,
      toolName,
      result,
    }
  } catch (error) {
    return {
      type: 'tool-result',
      toolCallId,
      toolName,
      result: error,
      isError: true,
    }
  }
}
