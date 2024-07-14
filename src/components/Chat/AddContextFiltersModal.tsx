import React, { useState, useEffect } from 'react'

import { List, ListItem } from '@material-tailwind/react'
import FolderIcon from '@mui/icons-material/Folder'
import { ListItemIcon, ListItemText } from '@mui/material'
import Slider from '@mui/material/Slider'
import { sub } from 'date-fns'
import { DayPicker } from 'react-day-picker'

import 'react-day-picker/dist/style.css'
import ReorModal from '../Common/Modal'
import SearchBarWithFilesSuggestion from '../Common/SearchBarWithFilesSuggestion'
import CustomSelect from '../Common/Select'
import { SuggestionsState } from '../Editor/BacklinkSuggestionsDisplay'

import { ChatFilters } from './Chat'

interface Props {
  isOpen: boolean
  onClose: () => void
  vaultDirectory: string
  setChatFilters: (chatFilters: ChatFilters) => void
  chatFilters: ChatFilters
}

const AddContextFiltersModal: React.FC<Props> = ({ vaultDirectory, isOpen, onClose, chatFilters, setChatFilters }) => {
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
  }, [internalFilesSelected, numberOfChunksToFetch, minDate, maxDate])

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
    <ReorModal isOpen={isOpen} onClose={onClose}>
      <div className="mb-6 ml-6 mt-2 h-full max-h-[90vh] w-[800px] overflow-y-auto overflow-x-hidden p-4">
        <h4 className="mb-4 text-center text-2xl text-white">
          Choose specific context files or customise the RAG search
        </h4>
        <div className="flex">
          {/* Left side: File selection */}
          <div className="flex-1 pr-4">
            <h3 className="mb-2 text-lg text-white">Select files for context</h3>
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
            <div className="mt-2 max-h-[300px] w-full overflow-y-auto text-white">
              <List placeholder="">
                {internalFilesSelected.map((fileItem, index) => (
                  <ListItem key={index} placeholder="">
                    <ListItemIcon>
                      <FolderIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={fileItem} />
                  </ListItem>
                ))}
              </List>
            </div>
          </div>

          {/* Vertical divider */}
          <div className="mx-4 flex flex-col items-center justify-center">
            <div className="w-px grow bg-gray-600" />
            <div className="my-2 flex size-8 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white">
              Or
            </div>
            <div className="w-px grow bg-gray-600" />
          </div>
          {/* Right side: Context settings */}
          <div
            className={`flex-1 pl-4
              
                `}
          >
            {/* ${
              internalFilesSelected.length > 0
                ? "opacity-30	 pointer-events-none"
                : ""
            } */}
            <h3 className="mb-2 text-lg text-white">Context settings</h3>
            <div className="mb-4 text-white">
              <p>Number of notes to add to context:</p>
              <div className="mt-2 w-full rounded bg-neutral-800 pb-3 pr-2">
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
              <div className="mt-2 text-center">{numberOfChunksToFetch}</div>
            </div>
            <div className="mb-4 text-white">
              <p>Filter context notes by last modified date:</p>
              <div className="mt-2 w-full rounded pb-1">
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
    </ReorModal>
  )
}

export default AddContextFiltersModal
