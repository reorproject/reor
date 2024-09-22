import React, { useState, useCallback, useEffect } from 'react'
import { CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { format, subDays, subHours, subWeeks, subMonths } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  from: Date
  to: Date
  onDateChange: (from: Date, to: Date) => void
}

const quickSelectOptions = [
  { label: 'Last hour', value: 'last-hour' },
  { label: 'Last 24 hours', value: 'last-day' },
  { label: 'Last 7 days', value: 'last-week' },
  { label: 'Last 30 days', value: 'last-month' },
  { label: 'Custom', value: 'custom' },
]

const DateRangePicker: React.FC<DateRangePickerProps> = ({ from, to, onDateChange }) => {
  const [activeOption, setActiveOption] = useState('custom')

  useEffect(() => {
    // Determine the active option based on the initial from and to props
    const now = new Date()
    if (from.getTime() === subHours(now, 1).getTime()) {
      setActiveOption('last-hour')
    } else if (from.getTime() === subDays(now, 1).getTime()) {
      setActiveOption('last-day')
    } else if (from.getTime() === subWeeks(now, 1).getTime()) {
      setActiveOption('last-week')
    } else if (from.getTime() === subMonths(now, 1).getTime()) {
      setActiveOption('last-month')
    } else {
      setActiveOption('custom')
    }
  }, [from, to])

  const updateDateRange = useCallback(
    (newFrom: Date, newTo: Date, option: string) => {
      onDateChange(newFrom, newTo)
      setActiveOption(option)
      console.log('New date range:', { from: newFrom, to: newTo })
    },
    [onDateChange],
  )

  const quickSelectRange = useCallback(
    (value: string) => {
      const now = new Date()
      let newFrom: Date
      switch (value) {
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
      updateDateRange(newFrom, now, value)
    },
    [updateDateRange],
  )

  const formatDateRange = () => {
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
            onClick={() => (option.value === 'custom' ? setActiveOption('custom') : quickSelectRange(option.value))}
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
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal bg-background text-foreground hover:bg-secondary',
              activeOption !== 'custom' && 'pointer-events-none opacity-50',
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {from ? formatDateRange() : <span>Pick a date range</span>}
            <ChevronDownIcon className="ml-auto size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto bg-background p-0" align="start">
          <div className="flex flex-col sm:flex-row">
            <div className="border-b border-border p-4 sm:border-b-0 sm:border-r">
              <Calendar
                mode="single"
                selected={from}
                onSelect={(date) => date && updateDateRange(date, to, 'custom')}
                initialFocus
                className="bg-background text-foreground"
              />
            </div>
            <div className="p-4">
              <Calendar
                mode="single"
                selected={to}
                onSelect={(date) => date && updateDateRange(from, date, 'custom')}
                initialFocus
                className="bg-background text-foreground"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default DateRangePicker
