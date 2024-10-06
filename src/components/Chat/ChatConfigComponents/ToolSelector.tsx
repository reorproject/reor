import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ToolDefinition } from '../../../lib/llm/types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ToolSelectorProps {
  allTools: ToolDefinition[]
  selectedTools: ToolDefinition[]
  onToolsChange: (tools: ToolDefinition[]) => void
}

const ToolSelector: React.FC<ToolSelectorProps> = ({ allTools, selectedTools, onToolsChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleTool = (tool: ToolDefinition) => {
    const isSelected = selectedTools.some((t) => t.name === tool.name)
    const newSelectedTools = isSelected ? selectedTools.filter((t) => t.name !== tool.name) : [...selectedTools, tool]
    onToolsChange(newSelectedTools)
  }

  return (
    <div className="relative w-32">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between bg-background text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Tools</span>
        <ChevronDown
          className={cn('ml-2 h-4 w-4 shrink-0 transition-transform duration-200', {
            'transform rotate-180': isOpen,
          })}
        />
      </Button>
      {isOpen && (
        <div className="absolute mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="py-1">
            {allTools.map((tool) => (
              <div
                key={tool.name}
                className={cn(
                  'flex items-center px-4 py-2 text-xs cursor-pointer',
                  'hover:bg-accent hover:text-accent-foreground',
                  {
                    'bg-accent text-accent-foreground': selectedTools.some((t) => t.name === tool.name),
                    'text-blue-600 font-medium': tool.name.toLowerCase() === 'paper',
                  },
                )}
                onClick={() => toggleTool(tool)}
              >
                {tool.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolSelector
