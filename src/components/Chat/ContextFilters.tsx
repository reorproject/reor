import React, { useState, useEffect } from 'react'

import { List, ListItem } from '@material-tailwind/react'
import FolderIcon from '@mui/icons-material/Folder'
import { ListItemIcon, ListItemText } from '@mui/material'
import Slider from '@mui/material/Slider'
import { sub } from 'date-fns'
import { DateRange, DayPicker } from 'react-day-picker'

import 'react-day-picker/dist/style.css'
import SearchBarWithFilesSuggestion from '../Common/SearchBarWithFilesSuggestion'
import CustomSelect from '../Common/Select'
import { SuggestionsState } from '../Editor/BacklinkSuggestionsDisplay'
import { ChatFilters } from './types'
import ClickPopover from '../Common/ClickPopover'

interface Props {
  vaultDirectory: string
  setChatFilters: (chatFilters: ChatFilters) => void
  chatFilters: ChatFilters
}

const ContextFilters: React.FC<Props> = ({ vaultDirectory, chatFilters, setChatFilters }) => {
  const [internalFilesSelected, setInternalFilesSelected] = useState<string[]>(chatFilters?.files || [])
  const [searchText, setSearchText] = useState<string>('')
  const [suggestionsState, setSuggestionsState] = useState<SuggestionsState | null>(null)
  const [numberOfChunksToFetch, setNumberOfChunksToFetch] = useState<number>(chatFilters.numberOfChunksToFetch || 15)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: chatFilters.minDate,
    to: chatFilters.maxDate,
  })
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Anytime')
  const [isPopoverOpen, setPopoverOpen] = useState(false)

  const togglePopover = () => {
    setPopoverOpen(!isPopoverOpen)
  }

  const dateRangeOptions = [
    { label: 'Anytime', value: 'anytime' },
    { label: 'Past hour', value: 'lastHour' },
    { label: 'Past 24 hours', value: 'lastDay' },
    { label: 'Past week', value: 'lastWeek' },
    { label: 'Past month', value: 'lastMonth' },
    { label: 'Past year', value: 'lastYear' },
  ]

  useEffect(() => {
    const updatedChatFilters: ChatFilters = {
      ...chatFilters,
      files: [...new Set([...chatFilters.files, ...internalFilesSelected])],
      numberOfChunksToFetch,
      minDate: dateRange.from || undefined,
      maxDate: dateRange.to || undefined,
    }
    setChatFilters(updatedChatFilters)
  }, [internalFilesSelected, numberOfChunksToFetch, dateRange, chatFilters, setChatFilters])

  const handleNumberOfChunksChange = (event: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value
    setNumberOfChunksToFetch(newValue)
  }

  const handleDateRangeChange = (value: string) => {
    const now = new Date()
    let newMinDate: Date | undefined
    switch (value) {
      case 'anytime':
        newMinDate = undefined
        break
      case 'lastHour':
        newMinDate = sub(now, { hours: 1 })
        break
      case 'lastDay':
        newMinDate = sub(now, { days: 1 })
        break
      case 'lastWeek':
        newMinDate = sub(now, { weeks: 1 })
        break
      case 'lastMonth':
        newMinDate = sub(now, { months: 1 })
        break
      case 'lastYear':
        newMinDate = sub(now, { years: 1 })
        break
      default:
        newMinDate = undefined
    }
    setDateRange({
      from: newMinDate,
      to: value === 'anytime' ? undefined : now,
    })
    setSelectedDateRange(dateRangeOptions.find((option) => option.value === value)?.label || '')
  }

  // Define the marks to be closer together
  const marks = Array.from({ length: 31 }, (_, i) => ({
    value: i,
    label: i % 5 === 0 ? i.toString() : '', // Show label every 5 steps
  }))

  useEffect(() => {}, [chatFilters])

  return (
    <div className="mb-4 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-3 py-1 text-white">
      <div
        className="relative cursor-pointer rounded-full border border-transparent bg-dark-gray-c-ten px-4 py-[8px] text-xs transition duration-150 ease-in-out hover:border-white hover:bg-neutral-700"
        onClick={togglePopover}
      >
        Files added to context: {internalFilesSelected.length}
        <ClickPopover isOpen={isPopoverOpen} onClose={() => setPopoverOpen(false)}>
          <div className="max-h-[300px] w-full overflow-y-auto">
            <SearchBarWithFilesSuggestion
              vaultDirectory={vaultDirectory}
              searchText={searchText}
              setSearchText={setSearchText}
              onSelectSuggestion={(file: string) => {
                if (file && !internalFilesSelected.includes(file)) {
                  setInternalFilesSelected([...internalFilesSelected, file])
                }
                setSuggestionsState(null)
              }}
              suggestionsState={suggestionsState}
              setSuggestionsState={setSuggestionsState}
            />
            <List placeholder="">
              {internalFilesSelected.map((filePath) => (
                <ListItem key={filePath} placeholder="" className="cursor-pointer">
                  <ListItemIcon>
                    <FolderIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={filePath} />
                </ListItem>
              ))}
            </List>
          </div>
        </ClickPopover>
      </div>
      {/* ${
              internalFilesSelected.length > 0
                ? "opacity-30	 pointer-events-none"
                : ""
            } */}
      <div
        className="relative cursor-pointer rounded-full border border-transparent bg-dark-gray-c-ten px-4 py-[8px] text-xs transition duration-150 ease-in-out hover:border-white hover:bg-neutral-700"
        onClick={togglePopover}
      >
        Number of context notes: {numberOfChunksToFetch}
        <ClickPopover isOpen={isPopoverOpen} onClose={() => setPopoverOpen(false)}>
          <div className="rounded bg-neutral-800 pb-3 pr-2">
            <Slider
              aria-label="Number of Notes"
              value={numberOfChunksToFetch}
              valueLabelDisplay="on"
              step={1}
              marks={marks}
              min={0}
              max={30}
              onChange={handleNumberOfChunksChange}
              sx={{
                '& .MuiSlider-thumb': {
                  '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: 'none',
                  },
                  '&::after': {
                    content: 'none',
                  },
                },
                '& .MuiSlider-valueLabel': {
                  fontSize: '0.75rem',
                  padding: '3px 6px',
                  lineHeight: '1.2em',
                },
                '& .MuiSlider-markLabel': {
                  color: '#FFFFFF',
                },
                '& .MuiSlider-mark': {
                  color: '#FFFFFF',
                },
              }}
            />
          </div>
        </ClickPopover>
      </div>
      <div
        className="relative cursor-pointer rounded-full border border-transparent bg-dark-gray-c-ten px-4 py-[8px] text-xs transition duration-150 ease-in-out hover:border-white hover:bg-neutral-700"
        onClick={togglePopover}
      >
        Date filter: {dateRange?.from && dateRange.from.toLocaleDateString()}
        {dateRange?.to && ` to ${dateRange.to.toLocaleDateString()}`}
        <ClickPopover isOpen={isPopoverOpen} onClose={() => setPopoverOpen(false)}>
          <div className="flex w-full flex-row items-baseline justify-between">
            <CustomSelect
              options={dateRangeOptions}
              selectedValue={selectedDateRange}
              onChange={handleDateRangeChange}
            />
            <DayPicker
              selected={dateRange}
              onSelect={(date) => date && setDateRange(date)}
              mode="range"
              className="my-day-picker w-full"
            />
          </div>
        </ClickPopover>
      </div>
    </div>
  )
}

export default ContextFilters
