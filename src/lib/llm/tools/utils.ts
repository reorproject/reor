import { CoreToolMessage, ToolCallPart, ToolResultPart } from 'ai'
import { z } from 'zod'
import { ToolName, toolNamesToFunctions } from './tool-definitions'
import { ReorChatMessage, ToolDefinition } from '../types'

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

      if (param.optional) {
        zodType = zodType.optional()
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

export const makeAndAddToolResultToMessages = async (
  messages: ReorChatMessage[],
  toolCallPart: ToolCallPart,
  assistantMessage: ReorChatMessage,
): Promise<ReorChatMessage[]> => {
  const toolResult = await createToolResult(toolCallPart.toolName, toolCallPart.args as any, toolCallPart.toolCallId)
  const toolMessage: CoreToolMessage = {
    role: 'tool',
    content: [toolResult],
  }

  const assistantIndex = messages.findIndex((msg) => msg === assistantMessage)
  if (assistantIndex === -1) {
    throw new Error('Assistant message not found')
  }

  return [...messages.slice(0, assistantIndex + 1), toolMessage, ...messages.slice(assistantIndex + 1)]
}

const autoExecuteTools = async (
  messages: ReorChatMessage[],
  toolDefinitions: ToolDefinition[],
  toolCalls: ToolCallPart[],
) => {
  const toolsThatNeedExecuting = toolCalls.filter((toolCall) => {
    const toolDefinition = toolDefinitions.find((definition) => definition.name === toolCall.toolName)
    return toolDefinition?.autoExecute
  })
  let outputMessages = messages
  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role !== 'assistant') {
    throw new Error('Last message is not an assistant message')
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const toolCall of toolsThatNeedExecuting) {
    // eslint-disable-next-line no-await-in-loop
    outputMessages = await makeAndAddToolResultToMessages(outputMessages, toolCall, lastMessage)
  }
  const allToolCallsHaveBeenExecuted =
    toolsThatNeedExecuting.length > 0 && toolsThatNeedExecuting.length === toolCalls.length
  return { messages: outputMessages, allToolCallsHaveBeenExecuted }
}

export const appendToolCallPartsToMessages = (
  messages: ReorChatMessage[],
  toolCalls: ToolCallPart[],
): ReorChatMessage[] => {
  if (toolCalls.length === 0) {
    return messages
  }

  if (messages.length === 0) {
    return [
      {
        role: 'assistant',
        content: toolCalls,
      },
    ]
  }

  const lastMessage = messages[messages.length - 1]

  if (lastMessage.role === 'assistant') {
    return [
      ...messages.slice(0, -1),
      {
        ...lastMessage,
        content: Array.isArray(lastMessage.content)
          ? [...lastMessage.content, ...toolCalls]
          : [{ type: 'text' as const, text: lastMessage.content }, ...toolCalls],
      },
    ]
  }

  return [
    ...messages,
    {
      role: 'assistant',
      content: toolCalls,
    },
  ]
}

export const appendToolCallsAndAutoExecuteTools = async (
  messages: ReorChatMessage[],
  toolDefinitions: ToolDefinition[],
  toolCalls: ToolCallPart[],
): Promise<{ messages: ReorChatMessage[]; allToolCallsHaveBeenExecuted: boolean }> => {
  const messagesWithToolCalls = appendToolCallPartsToMessages(messages, toolCalls)
  const { messages: messagesWithToolResults, allToolCallsHaveBeenExecuted } = await autoExecuteTools(
    messagesWithToolCalls,
    toolDefinitions,
    toolCalls,
  )
  return { messages: messagesWithToolResults, allToolCallsHaveBeenExecuted }
}
