/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo } from 'react'
import { ToolDefinition } from '../../../lib/llm/types'
import MultiSelect from '@/components/ui/multi-select'

interface ToolSelectorProps {
  allTools: ToolDefinition[]
  selectedTools: ToolDefinition[]
  onToolsChange: (tools: ToolDefinition[]) => void
}

const ToolSelector: React.FC<ToolSelectorProps> = ({ allTools = [], selectedTools = [], onToolsChange }) => {
  const options = useMemo(
    () =>
      allTools.map((tool) => ({
        value: tool.name,
        label: tool.name,
      })),
    [allTools],
  )

  const initialSelectedValues = useMemo(() => selectedTools.map((tool) => tool.name), [selectedTools])

  const handleSelectionChange = (selectedValues: string[]) => {
    const newSelectedTools = allTools.filter((tool) => selectedValues.includes(tool.name))
    onToolsChange(newSelectedTools)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Select Tools</label>
      <MultiSelect
        options={options}
        placeholder="Select tools..."
        onChange={handleSelectionChange}
        initialSelectedValues={initialSelectedValues}
      />
      <div className="text-sm text-muted-foreground">
        {selectedTools.length} tool{selectedTools.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  )
}

export default ToolSelector
