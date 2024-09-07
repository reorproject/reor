import React, { useEffect, useState } from 'react'
import { PiPaperPlaneRight } from 'react-icons/pi'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import PromptSuggestion from './ChatPrompts'
import '../../styles/chat.css'
import AddContextFiltersModal from './AddContextFiltersModal'
import { ChatFilters } from './types'

const EXAMPLE_PROMPT_OPTIONS = [
  'What have I written about Philosophy?',
  'Generate a study guide from my notes.',
  'Which authors have I discussed positively about?',
]

interface StartChatProps {
  defaultModelName: string
  handleNewChatMessage: (userTextFieldInput: string | undefined, chatFilters?: ChatFilters) => void
}

const StartChat: React.FC<StartChatProps> = ({ defaultModelName, handleNewChatMessage }) => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([])
  const [selectedLLM, setSelectedLLM] = useState<string>(defaultModelName)
  //   text input state:
  const [userTextFieldInput, setUserTextFieldInput] = useState<string | undefined>()
  const [chatFilters, setChatFilters] = useState<ChatFilters>({
    files: [],
    numberOfChunksToFetch: 15,
    minDate: new Date(0),
    maxDate: new Date(),
  })
  const [isAddContextFiltersModalOpen, setIsAddContextFiltersModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const fetchLLMModels = async () => {
      const LLMConfigs = await window.llm.getLLMConfigs()
      setLLMConfigs(LLMConfigs)
      const defaultLLM = await window.llm.getDefaultLLMName()
      setSelectedLLM(defaultLLM)
      console.log('fetched defaultLLM', defaultLLM)
    }
    fetchLLMModels()
  }, [])

  const sendMessageHandler = async () => {
    handleNewChatMessage(userTextFieldInput, chatFilters)
    await window.llm.setDefaultLLM(selectedLLM)
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
              className="m-1 cursor-pointer rounded-md border-0 bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
              onClick={() => {
                setIsAddContextFiltersModalOpen(true)
              }}
              type="button"
            >
              Customise context
            </button>
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
          {EXAMPLE_PROMPT_OPTIONS.map((option) => (
            <PromptSuggestion
              key={option}
              promptText={option}
              onClick={() => {
                // todo: fix this
              }}
            />
          ))}
        </div>
      </div>
      {isAddContextFiltersModalOpen && (
        <AddContextFiltersModal
          isOpen={isAddContextFiltersModalOpen}
          onClose={() => setIsAddContextFiltersModalOpen(false)}
          chatFilters={chatFilters}
          setChatFilters={setChatFilters}
        />
      )}
    </div>
  )
}

export default StartChat
