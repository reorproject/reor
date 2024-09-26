import React, { useState, useCallback, useEffect } from 'react'
import { CalendarIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import { format, subDays, subHours, subWeeks, subMonths } from 'date-fns'
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
  { label: 'Last 24 hours', value: 'last-day' },
  { label: 'Last 7 days', value: 'last-week' },
  { label: 'Last 30 days', value: 'last-month' },
  { label: 'Custom', value: 'custom' },
]

const DateRangePicker: React.FC<DateRangePickerProps> = ({ from, to, onDateChange }) => {
  const [activeOption, setActiveOption] = useState<string | null>()
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false)

  const updateDateRange = useCallback(
    (newFrom: Date | undefined, newTo: Date | undefined, option: string | null) => {
      console.log('newFrom', newFrom)
      console.log('newTo', newTo)
      onDateChange(newFrom, newTo)
      setActiveOption(option)
      if (option !== 'custom') {
        setIsDatePopoverOpen(false)
      }
    },
    [onDateChange],
  )

  useEffect(() => {
    console.log('from', from)
    console.log('to', to)
  }, [from, to])

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
    if (!from || !to) return 'Select date range'
    if (activeOption === 'last-hour') {
      return `${format(from, 'HH:mm')} - ${format(to, 'HH:mm')}`
    }
    return `${format(from, 'LLL dd, y')} - ${format(to, 'LLL dd, y')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {quickSelectOptions.map((option) => (
          <Button
            key={option.value}
            variant={activeOption === option.value ? 'default' : 'outline'}
            onClick={() => handleOptionClick(option.value)}
            className={cn(
              'grow sm:grow-0',
              activeOption === option.value
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-background text-foreground hover:bg-secondary',
            )}
          >
            {option.label}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={handleClear}
          className="grow bg-background text-foreground hover:bg-secondary sm:grow-0"
        >
          <XIcon className="mr-2 size-4" />
          Clear
        </Button>
      </div>
      {activeOption === 'custom' && (
        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start bg-background text-left font-normal text-foreground hover:bg-secondary"
            >
              <CalendarIcon className="mr-2 size-4" />
              {formatDateRange()}
              <ChevronDownIcon className="ml-auto size-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-background p-0" align="start">
            <div className="flex flex-col sm:flex-row">
              <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
                <Calendar
                  mode="single"
                  selected={from}
                  onSelect={(date) => updateDateRange(date || undefined, to, 'custom')}
                  initialFocus
                  className="bg-background text-foreground"
                />
              </div>
              <div className="p-4">
                <Calendar
                  mode="single"
                  selected={to}
                  onSelect={(date) => updateDateRange(from, date || undefined, 'custom')}
                  initialFocus
                  className="bg-background text-foreground"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export default DateRangePicker
