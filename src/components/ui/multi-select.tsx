import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  placeholder?: string
  onChange: (selectedValues: string[]) => void
  initialSelectedValues?: string[]
}

export const MultiSelect = ({
  options,
  placeholder = 'Select items...',
  onChange,
  initialSelectedValues = [],
}: MultiSelectProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(initialSelectedValues)

  useEffect(() => {
    setSelectedValues(initialSelectedValues)
  }, [initialSelectedValues])

  const handleSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    setSelectedValues(newSelectedValues)
    onChange(newSelectedValues)
  }

  const removeValue = (valueToRemove: string) => {
    const newSelectedValues = selectedValues.filter((value) => value !== valueToRemove)
    setSelectedValues(newSelectedValues)
    onChange(newSelectedValues)
  }

  const renderSelectedBadges = () => (
    <div className="flex flex-wrap gap-1">
      {selectedValues.map((value) => (
        <Badge key={value} variant="secondary" className="mr-1">
          {options.find((option) => option.value === value)?.label}
          <X
            className="ml-1 size-3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              removeValue(value)
            }}
          />
        </Badge>
      ))}
    </div>
  )

  return (
    <div className="relative">
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={selectedValues.length > 0 ? renderSelectedBadges() : placeholder}>
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((value) => (
                <Badge key={value} variant="secondary" className="mr-1">
                  {options.find((option) => option.value === value)?.label}
                  <X
                    className="ml-1 size-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeValue(value)
                    }}
                  />
                </Badge>
              ))}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => {}}
                  className="mr-2"
                />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default MultiSelect
