import React, { useState, useEffect } from 'react'

import { List, ListItem } from '@material-tailwind/react'
import FolderIcon from '@mui/icons-material/Folder'
import { ListItemIcon, ListItemText } from '@mui/material'
import Slider from '@mui/material/Slider'
import { sub } from 'date-fns'
import { DayPicker } from 'react-day-picker'

import 'react-day-picker/dist/style.css'
import SearchBarWithFilesSuggestion from '../Common/SearchBarWithFilesSuggestion'
import CustomSelect from '../Common/Select'
import { SuggestionsState } from '../Editor/BacklinkSuggestionsDisplay'
import { ChatFilters } from './chatUtils'

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
  const [minDate, setMinDate] = useState<Date | undefined>(chatFilters.minDate)
  const [maxDate, setMaxDate] = useState<Date | undefined>(chatFilters.maxDate)
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
  const [selectedDateRange, setSelectedDateRange] = useState<string>('Anytime')

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
      minDate: minDate || undefined,
      maxDate: maxDate || undefined,
    }
    setChatFilters(updatedChatFilters)
  }, [internalFilesSelected, numberOfChunksToFetch, minDate, maxDate, chatFilters, setChatFilters])

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
    setMinDate(newMinDate)
    setMaxDate(value === 'anytime' ? undefined : now)
    setSelectedDateRange(dateRangeOptions.find((option) => option.value === value)?.label || '')
  }

  const handleAdvancedToggle = () => {
    setShowAdvanced(!showAdvanced)
  }

  // Define the marks to be closer together
  const marks = Array.from({ length: 31 }, (_, i) => ({
    value: i,
    label: i % 5 === 0 ? i.toString() : '', // Show label every 5 steps
  }))

  useEffect(() => {}, [chatFilters])

  return (
    <div className="w-full">
      <h2 className="mb-8 text-center text-xl text-white">Choose specific context files or customise the RAG search</h2>
      <div className="mx-auto w-3/4 ">
        {/* Left side: File selection */}
        <h3 className="mb-0 text-lg text-white">Select files for context</h3>
        <div className="max-h-[300px] w-full overflow-y-auto text-white">
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

        {/* Right side: Context settings */}
        <div>
          {/* ${
              internalFilesSelected.length > 0
                ? "opacity-30	 pointer-events-none"
                : ""
            } */}
          <h3 className="mb-0 text-lg text-white">Context settings</h3>
          <div className="mb-4 text-white">
            <p>Number of notes to add to context: {numberOfChunksToFetch}</p>
            <div className="mt-2 rounded bg-neutral-800 pb-3 pr-2">
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
          </div>
          <div className="mb-4 text-white">
            <p>Filter context notes by last modified date:</p>
            <div className="rounded pb-1">
              <CustomSelect
                options={dateRangeOptions}
                selectedValue={selectedDateRange}
                onChange={handleDateRangeChange}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 cursor-pointer text-xs text-gray-500 underline" onClick={handleAdvancedToggle}>
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </div>
            {showAdvanced && (
              <div className="mt-2 flex space-x-4">
                <div className="flex flex-1 flex-col items-center text-white">
                  <p className="mb-1">Min Date:</p>
                  <DayPicker
                    selected={minDate}
                    onSelect={(date) => setMinDate(date || undefined)}
                    mode="single"
                    className="my-day-picker w-full"
                  />
                </div>
                <div className="flex flex-1 flex-col items-center text-white">
                  <p className="mb-1">Max Date:</p>
                  <DayPicker
                    selected={maxDate}
                    onSelect={(date) => setMaxDate(date || undefined)}
                    mode="single"
                    className="my-day-picker w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContextFilters
