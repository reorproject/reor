import React, { useState, useCallback } from 'react'
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
  const [isOpen, setIsOpen] = useState(false)

  const updateDateRange = useCallback(
    (newFrom: Date, newTo: Date, option: string) => {
      onDateChange(newFrom, newTo)
      setActiveOption(option)
      if (option !== 'custom') {
        setIsOpen(false)
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
      setIsOpen(true)
    }
  }

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
      </div>
      {activeOption === 'custom' && (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start bg-background text-left font-normal text-foreground hover:bg-secondary"
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
      )}
    </div>
  )
}

export default DateRangePicker
