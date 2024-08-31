import React, { useState, useEffect, useCallback } from 'react'
import { FaFolder, FaFile, FaTimes } from 'react-icons/fa'
import { List, ListItem, ListItemPrefix, Typography, Tooltip } from '@material-tailwind/react'
import Slider from '@mui/material/Slider'
import { sub } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { ChatFilters } from './types'
import CustomSelect from '../Common/Select'
import SearchBarWithFilesSuggestion from '../Common/SearchBarWithFilesSuggestion'
import { SuggestionsDisplayProps } from '../Editor/BacklinkSuggestionsDisplay'

interface ContextSettingsPopupProps {
  type: string
  chatFilters: ChatFilters
  setChatFilters: (newSettings: Partial<ChatFilters>) => void
  onClose: () => void
  vaultDirectory: string
}

const ContextSettingsPopup: React.FC<ContextSettingsPopupProps> = ({
  type,
  chatFilters,
  setChatFilters,
  onClose,
  vaultDirectory,
}) => {
  const [internalFilesSelected, setInternalFilesSelected] = useState<string[]>(chatFilters?.files || [])
  const [searchText, setSearchText] = useState<string>('')
  const [suggestionsState, setSuggestionsState] = useState<SuggestionsDisplayProps | null>(null)
  const [numberOfChunksToFetch, setNumberOfChunksToFetch] = useState<number>(chatFilters.numItems || 15)
  const [minDate, setMinDate] = useState<Date | undefined>(chatFilters.minDate)
  const [maxDate, setMaxDate] = useState<Date | undefined>(chatFilters.maxDate)
  const [selectedDateRange, setSelectedDateRange] = useState<string>(chatFilters.dateFilter || 'Anytime')
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)

  const dateRangeOptions = [
    { label: 'Anytime', value: 'anytime' },
    { label: 'Past hour', value: 'lastHour' },
    { label: 'Past 24 hours', value: 'lastDay' },
    { label: 'Past week', value: 'lastWeek' },
    { label: 'Past month', value: 'lastMonth' },
    { label: 'Past year', value: 'lastYear' },
  ]

  const handleNumItemsChange = (event: Event, value: number | number[]) => {
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

  const handleSearchTextChange = useCallback((value: string) => {
    setSearchText(value)
  }, [])

  const handleSelectSuggestion = useCallback(
    (file: string) => {
      if (file && !internalFilesSelected.includes(file)) {
        setInternalFilesSelected((prev) => [...prev, file])
      }
      setSearchText('')
    },
    [internalFilesSelected],
  )

  useEffect(() => {
    const updatedChatFilters: ChatFilters = {
      ...chatFilters,
      files: [...new Set([...chatFilters.files, ...internalFilesSelected])],
      numItems: numberOfChunksToFetch,
      minDate: minDate || undefined,
      maxDate: maxDate || undefined,
      dateFilter: selectedDateRange,
    }
    setChatFilters(updatedChatFilters)
  }, [internalFilesSelected, numberOfChunksToFetch, minDate, maxDate, selectedDateRange, chatFilters, setChatFilters])

  // const removeFile = useCallback(
  //   (fileToRemove: string) => {
  //     setInternalFilesSelected((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))
  //     setChatFilters((prevFilters) => ({
  //       ...prevFilters,
  //       files: prevFilters.files.filter((file) => file !== fileToRemove),
  //     }))
  //   },
  //   [setChatFilters],
  // )
  const removeFile = useCallback(
    (fileToRemove: string) => {
      setInternalFilesSelected((prevFiles) => prevFiles.filter((file) => file !== fileToRemove))
      setChatFilters({
        files: chatFilters.files.filter((file) => file !== fileToRemove),
      })
    },
    [setChatFilters, chatFilters.files],
  )

  const handleApply = useCallback(() => {
    let updatedFilters: Partial<ChatFilters> = {}

    switch (type) {
      case 'files':
        updatedFilters = { files: internalFilesSelected }
        break
      case 'items':
        updatedFilters = { numItems: numberOfChunksToFetch }
        break
      case 'date':
        updatedFilters = {
          minDate: minDate || undefined,
          maxDate: maxDate || undefined,
          dateFilter: selectedDateRange,
        }
        break
      default:
        // No changes to filters
        break
    }

    setChatFilters(updatedFilters)
    onClose()
  }, [type, internalFilesSelected, numberOfChunksToFetch, minDate, maxDate, selectedDateRange, setChatFilters, onClose])

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const marks = Array.from({ length: 31 }, (_, i) => ({
    value: i,
    label: i % 5 === 0 ? i.toString() : '',
  }))

  return (
    <div
      className="fixed left-1/2 top-1/2 z-50 w-96 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-800 p-6 shadow-xl"
      onClick={stopPropagation}
    >
      {type === 'files' && (
        <div>
          <Typography placeholder="Add Files to Context" variant="h6" color="white" className="mb-4">
            Add Files to Context
          </Typography>
          <div className="relative mb-4">
            <SearchBarWithFilesSuggestion
              vaultDirectory={vaultDirectory}
              searchText={searchText}
              setSearchText={handleSearchTextChange}
              onSelectSuggestion={handleSelectSuggestion}
              setSuggestionsState={setSuggestionsState}
            />
            {suggestionsState?.suggestions && suggestionsState.suggestions.length > 0 && (
              <div className="absolute left-full top-0 z-20 ml-2 max-h-60 w-64 overflow-y-auto rounded-md bg-gray-700 shadow-lg">
                <List placeholder="No files selected" className="p-0">
                  {suggestionsState.suggestions.map((suggestion: string) => (
                    <Tooltip
                      key={suggestion}
                      content={suggestion}
                      placement="top"
                      className="z-50 rounded bg-gray-900 p-2 text-xs text-white"
                      animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0, y: 25 },
                      }}
                    >
                      <ListItem
                        placeholder={suggestion}
                        className="cursor-pointer px-4 py-2 transition-colors duration-150 ease-in-out hover:bg-gray-600"
                        onClick={() => handleSelectSuggestion(suggestion)}
                      >
                        <ListItemPrefix placeholder={suggestion}>
                          {suggestion.endsWith('/') ? (
                            <FaFolder className="mr-2 text-yellow-500" />
                          ) : (
                            <FaFile className="mr-2 text-blue-500" />
                          )}
                        </ListItemPrefix>
                        <Typography placeholder={suggestion} variant="small" color="white" className="truncate">
                          {suggestion}
                        </Typography>
                      </ListItem>
                    </Tooltip>
                  ))}
                </List>
              </div>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            <List placeholder="No files selected" className="p-0">
              {internalFilesSelected.map((filePath) => (
                <Tooltip
                  key={filePath}
                  content={filePath}
                  placement="top"
                  className="z-50 rounded bg-gray-900 p-2 text-xs text-white"
                  animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0, y: 25 },
                  }}
                >
                  <ListItem
                    placeholder={filePath}
                    key={filePath}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-gray-700"
                  >
                    <div className="flex items-center overflow-hidden">
                      <ListItemPrefix placeholder={filePath}>
                        {filePath.endsWith('/') ? (
                          <FaFolder className="mr-2 text-yellow-500" />
                        ) : (
                          <FaFile className="mr-2 text-blue-500" />
                        )}
                      </ListItemPrefix>
                      <Typography
                        placeholder={filePath}
                        variant="small"
                        color="white"
                        className="max-w-[200px] truncate"
                      >
                        {filePath}
                      </Typography>
                    </div>
                    <FaTimes
                      className="cursor-pointer text-gray-400 hover:text-white"
                      onClick={() => removeFile(filePath)}
                    />
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </div>
        </div>
      )}
      {type === 'items' && (
        <div>
          <Typography placeholder="Number of Context Notes" variant="h6" color="white" className="mb-4">
            Number of Context Notes
          </Typography>
          <Slider
            value={numberOfChunksToFetch}
            onChange={handleNumItemsChange}
            min={0}
            max={30}
            step={1}
            marks={marks}
            valueLabelDisplay="auto"
            className="mb-4"
          />
          <Typography placeholder="Number of Context Notes" variant="small" color="white" className="text-center">
            {numberOfChunksToFetch}
          </Typography>
        </div>
      )}
      {type === 'date' && (
        <div>
          <Typography placeholder="Date Filter" variant="h6" color="white" className="mb-4">
            Date Filter
          </Typography>
          <CustomSelect options={dateRangeOptions} selectedValue={selectedDateRange} onChange={handleDateRangeChange} />
          <div
            className="mb-4 cursor-pointer text-sm text-blue-400 hover:text-blue-300"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </div>
          {showAdvanced && (
            <div className="mb-4">
              <DayPicker
                selected={minDate}
                onSelect={(date) => setMinDate(date || undefined)}
                mode="single"
                className="rounded-lg bg-gray-700 p-2"
              />
            </div>
          )}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleApply}
          type="button"
          className="rounded bg-blue-500 px-4 py-2 text-white transition-colors duration-150 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default ContextSettingsPopup
