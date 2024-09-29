import React, { useCallback, useEffect, useState } from 'react'
import { PiPaperPlaneRight } from 'react-icons/pi'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import '../../styles/chat.css'
import { AgentConfig, ToolDefinition, DatabaseSearchFilters } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardDescription } from '../ui/card'
import { allAvailableToolDefinitions } from './tools'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import DbSearchFilters from './ChatConfigComponents/DBSearchFilters'
import exampleAgents from './ChatConfigComponents/exampleAgents'
import PromptEditor from './ChatConfigComponents/PromptEditor'
import ToolSelector from './ChatConfigComponents/ToolSelector'

interface StartChatProps {
  defaultModelName: string
  handleNewChatMessage: (userTextFieldInput?: string, chatFilters?: AgentConfig) => void
}

const StartChat: React.FC<StartChatProps> = ({ defaultModelName, handleNewChatMessage }) => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([])
  const [selectedLLM, setSelectedLLM] = useState<string>(defaultModelName)
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>('')
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(exampleAgents[0])
  const [selectedTools, setSelectedTools] = useState<ToolDefinition[]>(agentConfig.toolDefinitions)

  useEffect(() => {
    const fetchLLMModels = async () => {
      const LLMConfigs = await window.llm.getLLMConfigs()
      setLLMConfigs(LLMConfigs)
      const defaultLLM = await window.llm.getDefaultLLMName()
      setSelectedLLM(defaultLLM)
    }
    fetchLLMModels()
  }, [])

  const sendMessageHandler = async () => {
    await window.llm.setDefaultLLM(selectedLLM)
    handleNewChatMessage(userTextFieldInput, agentConfig)
  }

  const handleAgentSelection = (agent: AgentConfig) => {
    setAgentConfig(agent)
    setSelectedTools(agent.toolDefinitions)
  }

  const handleLLMChange = (value: string) => {
    setSelectedLLM(value)
  }

  const handleToolsChange = (tools: ToolDefinition[]) => {
    setSelectedTools(tools)
    setAgentConfig((prevConfig) => ({ ...prevConfig, toolDefinitions: tools }))
  }

  const handleDbSearchFiltersChange = useCallback((newFilters: DatabaseSearchFilters) => {
    setAgentConfig((prevConfig) => ({
      ...prevConfig,
      dbSearchFilters: newFilters,
    }))
  }, [])

  const handleDbSearchToggle = (checked: boolean) => {
    setAgentConfig((prevConfig) => ({
      ...prevConfig,
      dbSearchFilters: checked
        ? {
            limit: 33,
            minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
            maxDate: new Date(),
          }
        : undefined,
    }))
  }

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative flex w-full flex-col text-center lg:top-10 lg:max-w-2xl">
        <div className="flex w-full justify-center">
          <img src="icon.png" style={{ width: '64px', height: '64px' }} alt="ReorImage" />
        </div>
        <h1 className="mb-10 text-[28px] text-foreground">
          Welcome to your AI-powered assistant! Start a conversation with your second brain!
        </h1>

        <div className="flex flex-col">
          <div className="flex flex-col rounded-md border-2 border-solid border-border bg-secondary focus-within:ring-1 focus-within:ring-ring">
            <textarea
              value={userTextFieldInput}
              onKeyDown={(e) => {
                if (!e.shiftKey && e.key === 'Enter') {
                  e.preventDefault()
                  sendMessageHandler()
                }
              }}
              className="h-[100px] w-full resize-none rounded-t-md border-0 bg-transparent p-4 text-primary caret-foreground focus:outline-none"
              placeholder="What can Reor help you with today?"
              onChange={(e) => setUserTextFieldInput(e.target.value)}
            />
            <div className="flex flex-col items-center justify-between gap-2 px-4 py-2 md:flex-row md:gap-4">
              <div className="flex flex-col items-center justify-between rounded-md border-0 py-2 md:flex-row">
                <Select value={selectedLLM} onValueChange={handleLLMChange}>
                  <SelectTrigger className="w-[180px] border border-solid border-border">
                    <SelectValue placeholder="Select LLM" />
                  </SelectTrigger>
                  <SelectContent>
                    {llmConfigs.map((llm) => (
                      <SelectItem key={llm.modelName} value={llm.modelName}>
                        {llm.modelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  <span className="text-primary">{agentConfig.name}</span>
                </span>
              </div>
              <button
                className="m-1 flex cursor-pointer items-center justify-center rounded-md bg-primary p-2 text-primary-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={sendMessageHandler}
                type="button"
                aria-label="Send message"
              >
                <PiPaperPlaneRight aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="mx-auto w-[96%] rounded-b border border-solid border-border bg-background px-4 py-2">
            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Edit Prompt</Button>
                </DialogTrigger>
                <DialogContent>
                  <PromptEditor
                    promptTemplate={agentConfig.promptTemplate}
                    onSave={(newPromptTemplate) => {
                      setAgentConfig((prevConfig) => ({ ...prevConfig, promptTemplate: newPromptTemplate }))
                    }}
                  />
                </DialogContent>
              </Dialog>

              <ToolSelector
                allTools={allAvailableToolDefinitions}
                selectedTools={selectedTools}
                onToolsChange={handleToolsChange}
              />

              <div className="flex items-center space-x-2">
                <Switch
                  id="db-search-toggle"
                  checked={!!agentConfig.dbSearchFilters}
                  onCheckedChange={handleDbSearchToggle}
                />
                <Label htmlFor="db-search-toggle" className="text-sm text-muted-foreground">
                  Include initial database search in context
                </Label>
              </div>

              {agentConfig.dbSearchFilters && (
                <DbSearchFilters
                  dbSearchFilters={agentConfig.dbSearchFilters}
                  onFiltersChange={handleDbSearchFiltersChange}
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 w-full justify-center md:flex-row lg:flex">
          {exampleAgents.map((agent) => (
            <Card
              key={agent.name}
              className={`m-4 w-28 cursor-pointer border-2 border-solid ${
                agentConfig.name === agent.name ? 'border-primary text-primary' : 'border-border text-muted-foreground'
              } bg-card transition-all duration-200 ease-in-out hover:border-accent hover:text-accent-foreground`}
              onClick={() => handleAgentSelection(agent)}
            >
              <CardDescription className="text-inherit">{agent.name}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StartChat
