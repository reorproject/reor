import { ToolConfig } from './types'

export const searchTool: ToolConfig = {
  name: 'search',
  description: "Semantically search the user's personal knowledge base",
  parameters: [
    {
      name: 'query',
      type: 'string',
      defaultValue: '',
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

export const toolNamesToFunctions = {
  search: async (query: string, limit: number) => {
    const results = await window.database.search(query, limit)
    return results
  },
}
