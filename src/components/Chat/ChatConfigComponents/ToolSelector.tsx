/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import { ToolDefinition } from '../types'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

interface ToolSelectorProps {
  allTools: ToolDefinition[]
  selectedTools: ToolDefinition[]
  onToolsChange: (tools: ToolDefinition[]) => void
}

const ToolSelector: React.FC<ToolSelectorProps> = ({ allTools = [], selectedTools = [], onToolsChange }) => {
  const handleToolChange = (checked: boolean, tool: ToolDefinition) => {
    if (checked) {
      onToolsChange([...selectedTools, tool])
    } else {
      onToolsChange(selectedTools.filter((t) => t.name !== tool.name))
    }
  }

  const toggleTool = (tool: ToolDefinition) => {
    const isSelected = selectedTools.some((t) => t.name === tool.name)
    if (isSelected) {
      onToolsChange(selectedTools.filter((t) => t.name !== tool.name))
    } else {
      onToolsChange([...selectedTools, tool])
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Select Tools</label>
      <div className="flex flex-col space-y-2">
        {allTools.map((tool) => (
          <div key={tool.name} className="flex items-center space-x-2">
            <Checkbox
              id={`tool-${tool.name}`}
              checked={selectedTools.some((t) => t.name === tool.name)}
              onCheckedChange={(checked) => handleToolChange(checked as boolean, tool)}
            />
            <label
              htmlFor={`tool-${tool.name}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {tool.name}
            </label>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTools.map((tool) => (
          <Badge key={tool.name} variant="secondary" className="cursor-pointer" onClick={() => toggleTool(tool)}>
            {tool.name}
            <span className="ml-1 text-xs">×</span>
          </Badge>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  )
}

export default ToolSelector
