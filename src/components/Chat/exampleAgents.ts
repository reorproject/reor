import { createNoteToolDefinition, searchToolDefinition } from './tools'
import { AgentConfig, PromptTemplate } from './types'

const defaultAgentPromptTemplate: PromptTemplate = [
  {
    role: 'system',
    content: `You are a helpful assistant helping a user organize and manage their personal knowledge and notes. 
  You will answer the user's question and help them with their request. 
  You can search the knowledge base by using the search tool and create new notes by using the create note tool.
  
  An initial query has been made and the context is already provided for you (so please do not call the search tool initially).`,
  },
  {
    role: 'user',
    content: `Context retrieved from your knowledge base for the query below: \n{CONTEXT}\n\n\nQuery for context above:\n{QUERY}`,
  },
]

const researchAgentPromptTemplate: PromptTemplate = [
  {
    role: 'system',
    content: `You are a helpful assistant helping a user organize and manage their personal knowledge and notes. 
  You will answer the user's question and help them with their request. 
  You can search the knowledge base by using the search tool and create new notes by using the create note tool.`,
  },
  {
    role: 'user',
    content: `{QUERY}`,
  },
]

const exampleAgents: AgentConfig[] = [
  {
    files: [],
    limit: 15,
    minDate: new Date(0),
    maxDate: new Date(),
    name: 'Default',
    toolDefinitions: [searchToolDefinition, createNoteToolDefinition],
    promptTemplate: defaultAgentPromptTemplate,
  },
  {
    files: [],
    limit: 15,
    minDate: new Date(0),
    maxDate: new Date(),
    name: 'Research Agent',
    toolDefinitions: [searchToolDefinition, createNoteToolDefinition],
    promptTemplate: researchAgentPromptTemplate,
  },
]

export default exampleAgents
