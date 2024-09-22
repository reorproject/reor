import { ToolResultPart } from 'ai'
import { z } from 'zod'
import { ToolDefinition } from './types'
import { retreiveFromVectorDB } from '@/utils/db'

export const searchToolDefinition: ToolDefinition = {
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
  autoExecute: true,
}

export const createNoteToolDefinition: ToolDefinition = {
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

export const allAvailableToolDefinitions: ToolDefinition[] = [searchToolDefinition, createNoteToolDefinition]

type ToolFunction = (...args: any[]) => Promise<any>

type ToolFunctionMap = {
  [key: string]: ToolFunction
}

export const toolNamesToFunctions: ToolFunctionMap = {
  search: async (query: string, limit: number): Promise<any[]> => {
    const results = await retreiveFromVectorDB(query, { limit, passFullNoteIntoContext: true })
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
  const out = await tool(...Object.values(args)) // TODO: make this cleaner quizas.
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

export function convertToolConfigToZodSchema(tool: ToolDefinition) {
  const parameterSchema = z.object(
    tool.parameters.reduce((acc, param) => {
      let zodType: z.ZodType<any>

      switch (param.type) {
        case 'string':
          zodType = z.string()
          break
        case 'number':
          zodType = z.number()
          break
        case 'boolean':
          zodType = z.boolean()
          break
        default:
          throw new Error(`Unsupported parameter type: ${param.type}`)
      }

      // Apply default value if it exists
      if (param.defaultValue !== undefined) {
        zodType = zodType.default(param.defaultValue)
      }

      // Apply description
      zodType = zodType.describe(param.description)

      return { ...acc, [param.name]: zodType }
    }, {}),
  )

  return {
    [tool.name]: {
      description: tool.description,
      parameters: parameterSchema,
    },
  }
}
