import React, { useEffect, useState } from 'react'
import { PiPaperPlaneRight } from 'react-icons/pi'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import '../../styles/chat.css'
import { AgentConfig } from './types'
import exampleAgents from './exampleAgents'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardDescription } from '../ui/card'

interface StartChatProps {
  defaultModelName: string
  handleNewChatMessage: (userTextFieldInput?: string, chatFilters?: AgentConfig) => void
}

const StartChat: React.FC<StartChatProps> = ({ defaultModelName, handleNewChatMessage }) => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([])
  const [selectedLLM, setSelectedLLM] = useState<string>(defaultModelName)
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>('')
  const [chatFilters, setChatFilters] = useState<AgentConfig>(exampleAgents[0])

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
    handleNewChatMessage(userTextFieldInput, chatFilters)
  }

  const handleAgentSelection = (agent: AgentConfig) => {
    setChatFilters(agent)
  }

  const handleLLMChange = (value: string) => {
    setSelectedLLM(value)
  }

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative flex size-full flex-col text-center lg:top-10 lg:max-w-2xl ">
        <div className="flex size-full justify-center">
          <img src="icon.png" style={{ width: '64px', height: '64px' }} alt="ReorImage" />
        </div>
        <h1 className="mb-10 text-[28px] text-foreground">
          Welcome to your AI-powered assistant! Start a conversation with your second brain!
        </h1>
        <div className="flex flex-col rounded-md border-2 border-solid border-border bg-input focus-within:ring-1 focus-within:ring-ring">
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
          <div className="h-px w-[calc(100%-2%)] flex-col self-center bg-border md:flex-row" />
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
                <span className="text-primary">{chatFilters.name}</span>
              </span>
            </div>
            <button
              className="m-1 flex cursor-pointer items-center justify-center rounded-md border-0 bg-primary p-2 text-primary-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={sendMessageHandler}
              type="button"
              aria-label="Send message"
            >
              <PiPaperPlaneRight aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="mt-4 size-full justify-center md:flex-row lg:flex">
          {exampleAgents.map((agent) => (
            <Card
              key={agent.name}
              className={`m-4 size-28 cursor-pointer border-2 border-solid ${
                chatFilters.name === agent.name ? 'border-primary text-primary' : 'border-border text-muted-foreground'
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
