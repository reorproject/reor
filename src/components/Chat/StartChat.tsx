import React, { useEffect, useState } from 'react'
import { PiPaperPlaneRight } from 'react-icons/pi'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import PromptSuggestion from './ChatPrompts'
import '../../styles/chat.css'
import { AgentConfig } from './types'
import exampleAgents from './exampleAgents'

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
    setUserTextFieldInput(`Using the ${agent.name} agent. How can I help you?`)
  }

  return (
    <div className="relative flex w-full flex-col items-center">
      <div className="relative flex size-full flex-col text-center lg:top-10 lg:max-w-2xl">
        <div className="flex size-full justify-center">
          <img src="icon.png" style={{ width: '64px', height: '64px' }} alt="ReorImage" />
        </div>
        <h1 className="mb-10 text-[28px] text-gray-300">
          Welcome to your AI-powered assistant! Start a conversation with your second brain!
        </h1>
        <div className="flex flex-col rounded-md bg-bg-000 focus-within:ring-1 focus-within:ring-[#8c8c8c]">
          <textarea
            value={userTextFieldInput}
            onKeyDown={(e) => {
              if (!e.shiftKey && e.key === 'Enter') {
                e.preventDefault()
                sendMessageHandler()
              }
            }}
            className="h-[100px] w-full resize-none rounded-t-md border-0 bg-transparent p-4 text-text-gen-100 caret-white focus:outline-none"
            placeholder="What can Reor help you with today?"
            onChange={(e) => setUserTextFieldInput(e.target.value)}
          />
          <div className="h-px w-[calc(100%-5%)] flex-col self-center bg-gray-600 md:flex-row" />
          <div className="flex flex-col items-center justify-between px-4 py-2 md:flex-row">
            <div className="flex flex-col items-center justify-between rounded-md border-0 py-2 text-text-gen-100 md:flex-row">
              <select
                value={selectedLLM}
                onChange={(e) => setSelectedLLM(e.target.value)}
                className="h-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {llmConfigs.map((llm) => (
                  <option key={llm.modelName} value={llm.modelName}>
                    {llm.modelName}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="m-1 flex cursor-pointer items-center justify-center rounded-md border-0 bg-blue-600 p-2 text-white hover:bg-blue-500"
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
            <PromptSuggestion key={agent.name} promptText={agent.name} onClick={() => handleAgentSelection(agent)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default StartChat
