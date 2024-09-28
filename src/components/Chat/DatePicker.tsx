import React, { useState, useCallback } from 'react'
import { CalendarIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import { subDays, subHours, subWeeks, subMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  from: Date | undefined
  to: Date | undefined
  onDateChange: (from: Date | undefined, to: Date | undefined) => void
}

const quickSelectOptions = [
  { label: 'Last hour', value: 'last-hour' },
  { label: 'Today', value: 'today' },
  { label: 'This week', value: 'this-week' },
  { label: 'This month', value: 'this-month' },
  { label: 'Custom', value: 'custom' },
]

const DateRangePicker: React.FC<DateRangePickerProps> = ({ from, to, onDateChange }) => {
  const [activeOption, setActiveOption] = useState<string | null>()
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)

  const updateDateRange = useCallback(
    (newFrom: Date | undefined, newTo: Date | undefined, option: string | null) => {
      onDateChange(newFrom, newTo)
      setActiveOption(option)
      if (option !== 'custom') {
        setIsDatePopoverOpen(false)
      }
    },
    [onDateChange],
  )

  const handleOptionClick = (option: string) => {
    setActiveOption(option)
    if (option !== 'custom') {
      const now = new Date()
      let newFrom: Date
      switch (option) {
        case 'last-hour':
          newFrom = subHours(now, 1)
          break
        case 'last-day':
          newFrom = subDays(now, 1)
          break
        case 'last-week':
          newFrom = subWeeks(now, 1)
          break
        case 'last-month':
          newFrom = subMonths(now, 1)
          break
        default:
          return
      }
      updateDateRange(newFrom, now, option)
    } else {
      setIsDatePopoverOpen(true)
    }
  }

  const handleClear = () => {
    updateDateRange(undefined, undefined, null)
  }

  const formatDateRange = () => {
    if (!from && !to) return 'Select date range'
    if (from && to) return `${from.toDateString()} - ${to.toDateString()}`
    if (from) return `From ${from.toDateString()}`
    if (to) return `To ${to.toDateString()}`
    return '' // Default case
  }

  const handleFromDateSelect = (date: Date | undefined) => {
    updateDateRange(date, to, 'custom')
  }

  const handleToDateSelect = (date: Date | undefined) => {
    updateDateRange(from, date, 'custom')
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {quickSelectOptions.map((option) => (
          <Button
            key={option.value}
            variant={activeOption === option.value ? 'default' : 'outline'}
            onClick={() => handleOptionClick(option.value)}
            className={cn(
              'grow px-2 py-1 text-sm sm:grow-0',
              activeOption === option.value
                ? 'bg-bg-primary/90 text-primary-foreground hover:bg-primary/90'
                : 'bg-secondary text-foreground hover:bg-secondary',
            )}
          >
            {option.label}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={handleClear}
          className="grow bg-background px-2 py-1 text-xs text-foreground hover:bg-secondary sm:grow-0"
        >
          <XIcon className="mr-1 size-3" />
          Clear
        </Button>
      </div>
      {activeOption === 'custom' && (
        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start bg-background px-2 py-1 text-left text-xs font-normal text-foreground hover:bg-secondary"
            >
              <CalendarIcon className="mr-1 size-3" />
              {formatDateRange()}
              <ChevronDownIcon className="ml-auto size-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-background p-0" align="start">
            <div className="flex flex-col sm:flex-row">
              <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
                <Calendar mode="single" selected={from} onSelect={handleFromDateSelect} initialFocus />
              </div>
              <div className="p-4">
                <Calendar mode="single" selected={to} onSelect={handleToDateSelect} initialFocus />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export default DateRangePicker
