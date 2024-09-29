import React, { useCallback } from 'react'
import { Slider } from '@/components/ui/slider'
import DateRangePicker from '../../ui/date-picker'
import { DatabaseSearchFilters } from '../types'

interface DbSearchFiltersProps {
  dbSearchFilters: DatabaseSearchFilters
  onFiltersChange: (newFilters: DatabaseSearchFilters) => void
}

const DbSearchFilters: React.FC<DbSearchFiltersProps> = ({ dbSearchFilters, onFiltersChange }) => {
  const inverseLogScale = (value: number) => Math.round(Math.log(value + 1) * 25)
  const logScale = (value: number) => Math.round(Math.exp(value / 25) - 1)

  const handleSliderChange = useCallback(
    (value: number[]) => {
      const scaledValue = logScale(value[0])
      onFiltersChange({
        ...dbSearchFilters,
        limit: scaledValue,
      })
    },
    [dbSearchFilters, onFiltersChange],
  )

  const handleDateChange = useCallback(
    (from: Date | undefined, to: Date | undefined) => {
      onFiltersChange({
        ...dbSearchFilters,
        minDate: from,
        maxDate: to,
      })
    },
    [dbSearchFilters, onFiltersChange],
  )

  return (
    <div className="space-y-2 rounded-md border border-foreground p-3">
      <div className="flex items-center space-x-2">
        <Slider
          defaultValue={[inverseLogScale(dbSearchFilters.limit)]}
          min={0}
          max={100}
          step={1}
          onValueChange={handleSliderChange}
        />
        <div className="flex flex-col">
          <span className="">{dbSearchFilters.limit} </span>
          <span className="text-xs">notes will be added to the context window from the initial search</span>
        </div>
      </div>
      <div className="flex flex-col items-start">
        <span className="mb-1 text-sm text-muted-foreground">Filter search by date (last modified):</span>
        <DateRangePicker from={dbSearchFilters.minDate} to={dbSearchFilters.maxDate} onDateChange={handleDateChange} />
      </div>
    </div>
  )
}

export default DbSearchFilters
