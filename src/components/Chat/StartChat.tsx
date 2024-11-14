// import React, { useCallback, useState } from 'react'
// import { PiPaperPlaneRight } from 'react-icons/pi'
// import { FiSettings } from 'react-icons/fi'
// import { AgentConfig, ToolDefinition, DatabaseSearchFilters } from '../../lib/llm/types'
// import { Button } from '@/components/ui/button'
// import DbSearchFilters from './ChatConfigComponents/DBSearchFilters'
// import PromptEditor from './ChatConfigComponents/PromptEditor'
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from '@/components/ui/drawer'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { Label } from '../ui/label'
// import { Switch } from '../ui/switch'
// import { allAvailableToolDefinitions } from '@/lib/llm/tools/tool-definitions'
// import ToolSelector from './ChatConfigComponents/ToolSelector'
// import SuggestionCard from '../ui/suggestion-card'
// import LLMSelectOrButton from '../Settings/LLMSettings/LLMSelectOrButton'
// import useLLMConfigs from '@/lib/hooks/use-llm-configs'
// import useAgentConfig from '@/lib/hooks/use-agent-configs'

// interface StartChatProps {
//   handleNewChatMessage: (llmName: string, userTextFieldInput?: string, chatFilters?: AgentConfig) => void
// }

// const StartChat: React.FC<StartChatProps> = ({ handleNewChatMessage }) => {
//   const { defaultLLM, setDefaultLLM } = useLLMConfigs()
//   const [selectedLLM, setSelectedLLM] = useState<string>(defaultLLM)
//   const [userTextFieldInput, setUserTextFieldInput] = useState<string>('')
//   const { agentConfig, setAgentConfig } = useAgentConfig()
//   const [promptSuggestions] = useState([
//     'Generate a list of all the thoughts I have written on the topic of AGI',
//     'Summarize my recent notes on machine learning',
//     'Based on what I wrote last week, which tasks should I focus on this week?',
//   ])

//   const sendMessageHandler = async () => {
//     await setDefaultLLM(selectedLLM)
//     if (!agentConfig) {
//       throw new Error('No agent config found')
//     }
//     handleNewChatMessage(selectedLLM, userTextFieldInput, { ...agentConfig })
//   }

//   const handleToolsChange = (tools: ToolDefinition[]) => {
//     setAgentConfig((prevConfig) => {
//       if (!prevConfig) throw new Error('Agent config must be initialized before setting tools')
//       return { ...prevConfig, toolDefinitions: tools }
//     })
//   }

//   const handleDbSearchFiltersChange = useCallback(
//     (newFilters: DatabaseSearchFilters) => {
//       setAgentConfig((prevConfig) => {
//         if (!prevConfig) throw new Error('Agent config must be initialized before setting db search filters')
//         return { ...prevConfig, dbSearchFilters: newFilters }
//       })
//     },
//     [setAgentConfig],
//   )

//   const handleDbSearchToggle = (checked: boolean) => {
//     setAgentConfig((prevConfig) => {
//       if (!prevConfig) throw new Error('Agent config must be initialized before setting db search filters')
//       return {
//         ...prevConfig,
//         dbSearchFilters: checked
//           ? {
//               limit: 33,
//               minDate: undefined,
//               maxDate: undefined,
//               passFullNoteIntoContext: true,
//             }
//           : undefined,
//       }
//     })
//   }

//   if (!agentConfig) return <div>Loading...</div>

//   return (
//     <div className="relative flex size-full flex-col items-center overflow-y-auto">
//       <div className="relative flex flex-col text-center lg:top-10 lg:max-w-4xl">
//         <div className="flex w-full justify-center">
//           <img src="icon.png" className="size-16" alt="ReorImage" />
//         </div>
//         <h1 className="mb-0 text-[28px] text-foreground">Welcome to your AI second brain.</h1>
//         <p className="mb-10 mt-1 text-muted-foreground">
//           Start a chat below. You can provide tools for the LLM to use and customize the system prompt below.{' '}
//         </p>
//         <div className="flex w-full">
//           <div className="mr-4">
//             <ToolSelector
//               allTools={allAvailableToolDefinitions}
//               selectedTools={agentConfig.toolDefinitions}
//               onToolsChange={handleToolsChange}
//             />
//           </div>
//           <div className="flex flex-col">
//             <div className="z-50 flex flex-col overflow-hidden rounded border-2 border-solid border-border bg-background focus-within:ring-1 focus-within:ring-ring">
//               <textarea
//                 value={userTextFieldInput}
//                 onKeyDown={(e) => {
//                   if (!e.shiftKey && e.key === 'Enter') {
//                     e.preventDefault()
//                     sendMessageHandler()
//                   }
//                 }}
//                 className="h-[100px] w-[600px] resize-none border-0 bg-transparent p-4 text-foreground caret-current focus:outline-none"
//                 placeholder="What can Reor help you with today?"
//                 onChange={(e) => setUserTextFieldInput(e.target.value)}
//                 // eslint-disable-next-line jsx-a11y/no-autofocus
//                 autoFocus
//               />
//               <div className="mx-auto h-px w-[96%] bg-background/20" />
//               <div className="flex h-10 flex-col items-center justify-between gap-2  py-2 md:flex-row md:gap-4">
//                 <div className="flex flex-col items-center justify-between rounded-md border-0 py-2 md:flex-row">
//                   <LLMSelectOrButton selectedLLM={selectedLLM} setSelectedLLM={setSelectedLLM} />
//                 </div>
//                 <div className="flex items-center">
//                   <Button
//                     className="m-2 flex items-center justify-between gap-2 bg-transparent text-primary hover:bg-transparent hover:text-accent-foreground"
//                     onClick={sendMessageHandler}
//                   >
//                     <PiPaperPlaneRight className="size-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>

//             <div
//               className="mx-auto w-full overflow-hidden rounded-b  border-0 border-solid border-border bg-background transition-all duration-300 ease-in-out"
//               style={{ maxHeight: '500px' }}
//             >
//               <div className="px-4">
//                 <div className="flex items-center justify-between px-2 py-1">
//                   <div className="flex items-center space-x-2">
//                     <span className="text-xs text-muted-foreground">Edit prompt:</span>
//                     <Popover>
//                       <PopoverTrigger asChild>
//                         <Button size="sm" variant="outline" className="bg-border text-primary">
//                           Prompt
//                         </Button>
//                       </PopoverTrigger>
//                       <PopoverContent className="w-full border border-solid border-muted-foreground bg-background">
//                         <PromptEditor
//                           promptTemplate={agentConfig.promptTemplate}
//                           onSave={(newPromptTemplate) => {
//                             setAgentConfig((prevConfig) => {
//                               if (!prevConfig)
//                                 throw new Error('Agent config must be initialized before setting prompt template')
//                               return { ...prevConfig, promptTemplate: newPromptTemplate }
//                             })
//                           }}
//                         />
//                       </PopoverContent>
//                     </Popover>
//                   </div>

//                   <div className="flex items-center">
//                     <div className="flex items-center">
//                       <Switch
//                         id="db-search-toggle"
//                         checked={!!agentConfig.dbSearchFilters}
//                         onCheckedChange={handleDbSearchToggle}
//                         className="scale-75"
//                       />
//                       <Label htmlFor="db-search-toggle" className="ml-1 text-xs text-muted-foreground">
//                         Make knowledge base search
//                       </Label>
//                     </div>
//                     <Drawer>
//                       <DrawerTrigger asChild>
//                         <Button
//                           variant="secondary"
//                           size="icon"
//                           className="ml-1 size-8 rounded-full"
//                           disabled={!agentConfig.dbSearchFilters}
//                         >
//                           {' '}
//                           <FiSettings className="size-3" />
//                           <span className="sr-only">Open DB search settings</span>
//                         </Button>
//                       </DrawerTrigger>
//                       <DrawerContent>
//                         <DrawerHeader>
//                           <DrawerTitle>Database Search Filters</DrawerTitle>
//                           <DrawerDescription>Configure your database search filters</DrawerDescription>
//                         </DrawerHeader>
//                         {agentConfig.dbSearchFilters && (
//                           <DbSearchFilters
//                             dbSearchFilters={agentConfig.dbSearchFilters}
//                             onFiltersChange={handleDbSearchFiltersChange}
//                           />
//                         )}
//                         <DrawerFooter>
//                           <Button
//                             onClick={() =>
//                               setAgentConfig((prev) => {
//                                 if (!prev) throw new Error('Agent config must be initialized')
//                                 return { ...prev, dbSearchFilters: prev.dbSearchFilters }
//                               })
//                             }
//                           >
//                             Save Changes
//                           </Button>
//                           <DrawerClose asChild>
//                             <Button variant="outline">Cancel</Button>
//                           </DrawerClose>
//                         </DrawerFooter>
//                       </DrawerContent>
//                     </Drawer>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* New suggestion cards */}
//             <div className="mt-10 grid grid-cols-3 gap-4">
//               {promptSuggestions.map((suggestion, index) => (
//                 <SuggestionCard
//                   // eslint-disable-next-line react/no-array-index-key
//                   key={index}
//                   suggestion={suggestion}
//                   onClick={() => {
//                     setUserTextFieldInput(suggestion)
//                     sendMessageHandler()
//                   }}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default StartChat
