/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react'
import { ToolDefinition } from './types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface ToolSelectorProps {
  allTools: ToolDefinition[]
  selectedTools: ToolDefinition[]
  onToolsChange: (tools: ToolDefinition[]) => void
}

const ToolSelector: React.FC<ToolSelectorProps> = ({ allTools = [], selectedTools = [], onToolsChange }) => {
  const handleToolChange = (value: string) => {
    const tool = allTools.find((t) => t.name === value)
    if (tool) {
      const isSelected = selectedTools.some((t) => t.name === tool.name)
      if (isSelected) {
        onToolsChange(selectedTools.filter((t) => t.name !== tool.name))
      } else {
        onToolsChange([...selectedTools, tool])
      }
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
      <Select onValueChange={handleToolChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a tool" />
        </SelectTrigger>
        <SelectContent>
          {allTools.map((tool) => (
            <SelectItem key={tool.name} value={tool.name}>
              {tool.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
