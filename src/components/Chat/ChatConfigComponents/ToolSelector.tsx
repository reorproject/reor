/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ChevronDown, X } from 'lucide-react'
import { ToolDefinition } from '../../../lib/llm/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ToolSelectorProps {
  allTools: ToolDefinition[]
  selectedTools: ToolDefinition[]
  onToolsChange: (tools: ToolDefinition[]) => void
}

const ToolSelector: React.FC<ToolSelectorProps> = ({ allTools = [], selectedTools = [], onToolsChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleTool = (tool: ToolDefinition) => {
    const isSelected = selectedTools.some((t) => t.name === tool.name)
    const newSelectedTools = isSelected ? selectedTools.filter((t) => t.name !== tool.name) : [...selectedTools, tool]
    onToolsChange(newSelectedTools)
  }

  const removeTool = (toolToRemove: ToolDefinition, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelectedTools = selectedTools.filter((tool) => tool.name !== toolToRemove.name)
    onToolsChange(newSelectedTools)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Select Tools</label>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="h-auto min-h-10 w-full justify-between px-3 py-2 hover:bg-transparent"
          >
            <div className="flex flex-wrap items-center gap-1">
              {selectedTools.length === 0 ? (
                <span className="text-muted-foreground">Select tools...</span>
              ) : (
                selectedTools.map((tool) => (
                  <Badge key={tool.name} variant="secondary" className="mr-1">
                    {tool.name}
                    <X className="ml-1 size-3 cursor-pointer" onClick={(e) => removeTool(tool, e)} />
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="z-50 w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none"
            sideOffset={4}
          >
            <div className="max-h-[200px] overflow-auto">
              {allTools.map((tool) => (
                <div
                  key={tool.name}
                  className={cn(
                    'flex items-center px-2 py-1 cursor-pointer',
                    'hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => toggleTool(tool)}
                >
                  <Checkbox
                    id={`tool-${tool.name}`}
                    checked={selectedTools.some((t) => t.name === tool.name)}
                    onCheckedChange={() => toggleTool(tool)}
                    className="mr-2"
                  />
                  <label htmlFor={`tool-${tool.name}`} className="grow cursor-pointer text-sm">
                    {tool.name}
                  </label>
                </div>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}

export default ToolSelector
