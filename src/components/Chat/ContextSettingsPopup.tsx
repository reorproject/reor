import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { FaFolder, FaFile, FaTimes } from 'react-icons/fa'
import { List, ListItem, ListItemPrefix, Typography } from '@material-tailwind/react'
import Slider from '@mui/material/Slider'
import { sub } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { ChatFilters } from './types'
import CustomSelect from '../Common/Select'
import SearchBarWithFilesSuggestion from '../Common/SearchBarWithFilesSuggestion'
import InEditorBacklinkSuggestionsDisplay, { SuggestionsState } from '../Editor/BacklinkSuggestionsDisplay'
import useFileInfoTree from '../Sidebars/FileSideBar/hooks/use-file-info-tree'

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
  const [suggestionsState, setSuggestionsState] = useState<SuggestionsState | null>(null)
  const [numberOfChunksToFetch, setNumberOfChunksToFetch] = useState<number>(chatFilters.numItems || 15)
  const [minDate, setMinDate] = useState<Date | undefined>(chatFilters.minDate)
  const [maxDate, setMaxDate] = useState<Date | undefined>(chatFilters.maxDate)
  const [selectedDateRange, setSelectedDateRange] = useState<string>(chatFilters.dateFilter || 'Anytime')
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false)

  const { flattenedFiles } = useFileInfoTree(vaultDirectory)

  const memoizedFlattenedFiles = useMemo(() => flattenedFiles, [flattenedFiles])

  const dateRangeOptions = [
    { label: 'Anytime', value: 'anytime' },
    { label: 'Past hour', value: 'lastHour' },
    { label: 'Past 24 hours', value: 'lastDay' },
    { label: 'Past week', value: 'lastWeek' },
    { label: 'Past month', value: 'lastMonth' },
    { label: 'Past year', value: 'lastYear' },
  ]

  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('ContextSettingsPopup - Important values changed:', {
      type,
      vaultDirectory,
      chatFilters,
      flattenedFilesCount: memoizedFlattenedFiles.length,
    })
  }, [type, vaultDirectory, chatFilters, memoizedFlattenedFiles])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  const handleNumItemsChange = useCallback((event: Event, value: number | number[]) => {
    const newValue = Array.isArray(value) ? value[0] : value
    setNumberOfChunksToFetch(newValue)
  }, [])

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

  const handleSelectSuggestion = useCallback(
    (file: string) => {
      console.log('ContextSettingsPopup - Suggestion selected:', file)
      if (file && !internalFilesSelected.includes(file)) {
        setInternalFilesSelected((prev) => [...prev, file])
      }
      setSearchText('')
      setSuggestionsState(null)
    },
    [internalFilesSelected],
  )

  const handleSearchTextChange = useCallback(
    (value: string) => {
      console.log('ContextSettingsPopup - Search text changed:', value)
      setSearchText(value)

      // Update suggestionsState when search text changes
      if (value.length > 0) {
        setSuggestionsState({
          textWithinBrackets: value,
          position: { top: 0, left: 0 }, // We'll adjust this in the render
          onSelect: handleSelectSuggestion,
        })
      } else {
        setSuggestionsState(null)
      }
    },
    [handleSelectSuggestion],
  )

  useEffect(() => {
    if (type === 'files') {
      setChatFilters({
        files: [...new Set([...chatFilters.files, ...internalFilesSelected])],
      })
    }
  }, [internalFilesSelected, type, setChatFilters, chatFilters.files])

  useEffect(() => {
    if (type === 'items') {
      setChatFilters({ numItems: numberOfChunksToFetch })
    }
  }, [numberOfChunksToFetch, type, setChatFilters])

  useEffect(() => {
    if (type === 'date') {
      setChatFilters({
        minDate: minDate || undefined,
        maxDate: maxDate || undefined,
        dateFilter: selectedDateRange,
      })
    }
  }, [minDate, maxDate, selectedDateRange, type, setChatFilters])

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

    console.log('Applying filters:', updatedFilters)
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

  const setSuggestionsStateCallback = useCallback((state: SuggestionsState | null) => {
    setSuggestionsState(state)
  }, [])

  // useEffect(() => {
  //   console.log('ContextSettingsPopup - suggestionsState:', suggestionsState)
  // }, [suggestionsState])

  return (
    <div
      ref={popupRef}
      className="fixed left-1/2 top-1/2 z-50 w-96 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-800 p-6 shadow-xl"
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
              suggestionsState={suggestionsState}
              setSuggestionsState={setSuggestionsStateCallback}
            />
            {suggestionsState && (
              <div className="absolute inset-x-0 z-10">
                <InEditorBacklinkSuggestionsDisplay
                  suggestionsState={{
                    ...suggestionsState,
                    position: { top: 0, left: 0 }, // Position relative to parent
                  }}
                  suggestions={memoizedFlattenedFiles.map((file) => file.path)}
                  maxWidth="w-full"
                />
              </div>
            )}
          </div>
          <div className="max-h-60 overflow-y-auto">
            <List placeholder="No files selected" className="p-0">
              {internalFilesSelected.map((filePath) => (
                <ListItem
                  placeholder={filePath}
                  key={filePath}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-neutral-700"
                >
                  <div className="flex items-center overflow-hidden">
                    <ListItemPrefix placeholder={filePath}>
                      {filePath.endsWith('/') ? (
                        <FaFolder className="mr-2 text-yellow-500" />
                      ) : (
                        <FaFile className="mr-2 text-blue-500" />
                      )}
                    </ListItemPrefix>
                    <Typography placeholder={filePath} variant="small" color="white" className="max-w-[200px] truncate">
                      {filePath}
                    </Typography>
                  </div>
                  <FaTimes
                    className="cursor-pointer text-gray-400 hover:text-white"
                    onClick={() => removeFile(filePath)}
                  />
                </ListItem>
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
            sx={{
              color: '#3b82f6',
              '& .MuiSlider-thumb': {
                backgroundColor: '#3b82f6',
              },
              '& .MuiSlider-rail': {
                backgroundColor: '#4b5563',
              },
              '& .MuiSlider-mark': {
                backgroundColor: '#9ca3af',
              },
            }}
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
                className="rounded-lg bg-neutral-700 p-2"
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
