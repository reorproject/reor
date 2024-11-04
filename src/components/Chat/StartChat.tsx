import React, { useCallback, useEffect, useState, useRef } from 'react'
import { PiPaperPlaneRight } from 'react-icons/pi'
import { FiSettings } from 'react-icons/fi'
import { LLMConfig } from 'electron/main/electron-store/storeConfig'
import { AgentConfig, ToolDefinition, DatabaseSearchFilters } from '../../lib/llm/types'
import { Button } from '@/components/ui/button'
import DbSearchFilters from './ChatConfigComponents/DBSearchFilters'
import PromptEditor from './ChatConfigComponents/PromptEditor'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import exampleAgents from './ChatConfigComponents/exampleAgents'
import { allAvailableToolDefinitions } from '@/lib/llm/tools/tool-definitions'
import ToolSelector from './ChatConfigComponents/ToolSelector'
import SuggestionCard from '../ui/suggestion-card'
import LLMSelectOrButton from '../Settings/LLMSettings/LLMSelectOrButton'
import FileAutocomplete from './FileAutocomplete'

interface StartChatProps {
  defaultModelName: string
  handleNewChatMessage: (userTextFieldInput?: string, chatFilters?: AgentConfig) => void
}

const StartChat: React.FC<StartChatProps> = ({ defaultModelName, handleNewChatMessage }) => {
  const [llmConfigs, setLLMConfigs] = useState<LLMConfig[]>([])
  const [selectedLLM, setSelectedLLM] = useState<string>(defaultModelName)
  const [userTextFieldInput, setUserTextFieldInput] = useState<string>('')
  const [agentConfig, setAgentConfig] = useState<AgentConfig>()
  const [promptSuggestions] = useState([
    'Generate a list of all the thoughts I have written on the topic of AGI',
    'Summarize my recent notes on machine learning',
    'Based on what I wrote last week, which tasks should I focus on this week?',
  ])
  const [showFileAutocomplete, setShowFileAutocomplete] = useState(false)
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchAgentConfigs = async () => {
      const agentConfigs = await window.electronStore.getAgentConfigs()
      if (agentConfigs && agentConfigs.length > 0) {
        setAgentConfig(agentConfigs[0])
      } else {
        setAgentConfig(exampleAgents[0])
      }
    }
    fetchAgentConfigs()
  }, [])

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
    if (!agentConfig) {
      throw new Error('No agent config found')
    }
    handleNewChatMessage(userTextFieldInput, { ...agentConfig })
  }

  const handleToolsChange = (tools: ToolDefinition[]) => {
    setAgentConfig((prevConfig) => {
      if (!prevConfig) throw new Error('Agent config must be initialized before setting tools')
      return { ...prevConfig, toolDefinitions: tools }
    })
  }

  const handleDbSearchFiltersChange = useCallback((newFilters: DatabaseSearchFilters) => {
    setAgentConfig((prevConfig) => {
      if (!prevConfig) throw new Error('Agent config must be initialized before setting db search filters')
      return { ...prevConfig, dbSearchFilters: newFilters }
    })
  }, [])

  const handleDbSearchToggle = (checked: boolean) => {
    setAgentConfig((prevConfig) => {
      if (!prevConfig) throw new Error('Agent config must be initialized before setting db search filters')
      return {
        ...prevConfig,
        dbSearchFilters: checked
          ? {
              limit: 33,
              minDate: undefined,
              maxDate: undefined,
              passFullNoteIntoContext: true,
            }
          : undefined,
      }
    })
  }

  const getCaretCoordinates = (element: HTMLTextAreaElement) => {
    const { selectionStart, value } = element
    const textBeforeCaret = value.substring(0, selectionStart)

    // Create a hidden div with the same styling as textarea
    const mirror = document.createElement('div')
    mirror.style.cssText = window.getComputedStyle(element).cssText
    mirror.style.height = 'auto'
    mirror.style.position = 'absolute'
    mirror.style.visibility = 'hidden'
    mirror.style.whiteSpace = 'pre-wrap'
    document.body.appendChild(mirror)

    // Create a span for the text before caret
    const textNode = document.createTextNode(textBeforeCaret)
    const span = document.createElement('span')
    span.appendChild(textNode)
    mirror.appendChild(span)

    // Get coordinates
    const coordinates = {
      top: span.offsetTop + parseInt(window.getComputedStyle(element).lineHeight, 10) / 2,
      left: span.offsetLeft,
    }

    // Clean up
    document.body.removeChild(mirror)

    return coordinates
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      sendMessageHandler()
    } else if (e.key === '@') {
      const rect = e.currentTarget.getBoundingClientRect()
      const position = getCaretCoordinates(e.currentTarget)
      setAutocompletePosition({
        top: rect.top + position.top,
        left: rect.left + position.left,
      })
      setShowFileAutocomplete(true)
    } else if (showFileAutocomplete && e.key === 'Escape') {
      setShowFileAutocomplete(false)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target
    setUserTextFieldInput(value)

    // Handle @ mentions
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex !== -1 && lastAtIndex < value.length) {
      const searchText = value.slice(lastAtIndex + 1).split(/\s/)[0]
      setSearchTerm(searchText)
    } else {
      setShowFileAutocomplete(false)
    }

    // Adjust textarea height
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`
  }

  const handleFileSelect = (filePath: string) => {
    const lastAtIndex = userTextFieldInput.lastIndexOf('@')
    const newValue = `${userTextFieldInput.slice(0, lastAtIndex)}@${filePath} ${userTextFieldInput.slice(
      lastAtIndex + searchTerm.length + 1,
    )}`

    setUserTextFieldInput(newValue)
    setShowFileAutocomplete(false)
  }

  if (!agentConfig) return <div>Loading...</div>

  return (
    <div className="relative flex size-full flex-col items-center overflow-y-auto">
      <div className="relative flex flex-col text-center lg:top-10 lg:max-w-4xl">
        <div className="flex w-full justify-center">
          <img src="icon.png" className="size-16" alt="ReorImage" />
        </div>
        <h1 className="mb-0 text-[28px] text-foreground">Welcome to your AI second brain.</h1>
        <p className="mb-10 mt-1 text-muted-foreground">
          Start a chat below. You can provide tools for the LLM to use and customize the system prompt below.{' '}
        </p>
        <div className="flex w-full">
          <div className="mr-4">
            <ToolSelector
              allTools={allAvailableToolDefinitions}
              selectedTools={agentConfig.toolDefinitions}
              onToolsChange={handleToolsChange}
            />
          </div>
          <div className="flex flex-col">
            <div className="z-50 flex flex-col overflow-hidden rounded border-2 border-solid border-border bg-background focus-within:ring-1 focus-within:ring-ring">
              <textarea
                ref={textareaRef}
                value={userTextFieldInput}
                onKeyDown={handleKeyDown}
                onChange={handleInput}
                className="h-[100px] w-[600px] resize-none border-0 bg-transparent p-4 text-foreground caret-current focus:outline-none"
                placeholder="Type @ to reference files..."
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              <FileAutocomplete
                searchTerm={searchTerm}
                position={autocompletePosition}
                onSelect={handleFileSelect}
                visible={showFileAutocomplete}
              />
              <div className="mx-auto h-px w-[96%] bg-background/20" />
              <div className="flex h-10 flex-col items-center justify-between gap-2  py-2 md:flex-row md:gap-4">
                <div className="flex flex-col items-center justify-between rounded-md border-0 py-2 md:flex-row">
                  <LLMSelectOrButton
                    llmConfigs={llmConfigs}
                    selectedLLM={selectedLLM}
                    setSelectedLLM={setSelectedLLM}
                    setLLMConfigs={setLLMConfigs}
                  />
                </div>
                <div className="flex items-center">
                  <Button
                    className="m-2 flex items-center justify-between gap-2 bg-transparent text-primary hover:bg-transparent hover:text-accent-foreground"
                    onClick={sendMessageHandler}
                  >
                    <PiPaperPlaneRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="mx-auto w-full overflow-hidden rounded-b  border-0 border-solid border-border bg-background transition-all duration-300 ease-in-out"
              style={{ maxHeight: '500px' }}
            >
              <div className="px-4">
                <div className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Edit prompt:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline" className="bg-border text-primary">
                          Prompt
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full border border-solid border-muted-foreground bg-background">
                        <PromptEditor
                          promptTemplate={agentConfig.promptTemplate}
                          onSave={(newPromptTemplate) => {
                            setAgentConfig((prevConfig) => {
                              if (!prevConfig)
                                throw new Error('Agent config must be initialized before setting prompt template')
                              return { ...prevConfig, promptTemplate: newPromptTemplate }
                            })
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Switch
                        id="db-search-toggle"
                        checked={!!agentConfig.dbSearchFilters}
                        onCheckedChange={handleDbSearchToggle}
                        className="scale-75"
                      />
                      <Label htmlFor="db-search-toggle" className="ml-1 text-xs text-muted-foreground">
                        Make knowledge base search
                      </Label>
                    </div>
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="ml-1 size-8 rounded-full"
                          disabled={!agentConfig.dbSearchFilters}
                        >
                          {' '}
                          <FiSettings className="size-3" />
                          <span className="sr-only">Open DB search settings</span>
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <DrawerHeader>
                          <DrawerTitle>Database Search Filters</DrawerTitle>
                          <DrawerDescription>Configure your database search filters</DrawerDescription>
                        </DrawerHeader>
                        {agentConfig.dbSearchFilters && (
                          <DbSearchFilters
                            dbSearchFilters={agentConfig.dbSearchFilters}
                            onFiltersChange={handleDbSearchFiltersChange}
                          />
                        )}
                        <DrawerFooter>
                          <Button
                            onClick={() =>
                              setAgentConfig((prev) => {
                                if (!prev) throw new Error('Agent config must be initialized')
                                return { ...prev, dbSearchFilters: prev.dbSearchFilters }
                              })
                            }
                          >
                            Save Changes
                          </Button>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>
              </div>
            </div>

            {/* New suggestion cards */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {promptSuggestions.map((suggestion, index) => (
                <SuggestionCard
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  suggestion={suggestion}
                  onClick={() => {
                    setUserTextFieldInput(suggestion)
                    sendMessageHandler()
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StartChat
