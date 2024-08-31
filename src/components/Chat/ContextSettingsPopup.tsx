import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Typography } from '@material-tailwind/react'
import Slider from '@mui/material/Slider'
import { sub } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { ChatFilters } from './types'
import CustomSelect from '../Common/Select'
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
      if (file && !internalFilesSelected.includes(file)) {
        setInternalFilesSelected((prev) => [...prev, file])
      }
      setSearchText('')
    },
    [internalFilesSelected],
  )

  const handleSearchTextChange = useCallback((value: string) => {
    setSearchText(value)
  }, [])

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

  return (
    <div
      ref={popupRef}
      className="fixed left-1/2 top-1/2 z-50 w-96 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-800 p-6 shadow-xl"
      onClick={stopPropagation}
    >
      {type === 'files' && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">Add Files to Context</h2>
          <div className="mb-4">
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={searchText}
              onChange={(e) => handleSearchTextChange(e.target.value)}
              placeholder="Search for files by name"
            />
          </div>
          {searchText && (
            <ul className="mb-4 max-h-40 overflow-y-auto rounded-md bg-neutral-700 p-2">
              {memoizedFlattenedFiles
                .filter((file) => file.path.toLowerCase().includes(searchText.toLowerCase()))
                .map((file) => (
                  <li key={file.path}>
                    <button
                      type="button"
                      className="w-full cursor-pointer p-1 text-left hover:bg-neutral-600"
                      onClick={() => handleSelectSuggestion(file.path)}
                    >
                      {file.path.split('/').pop()}
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <ul className="max-h-60 overflow-y-auto">
            {internalFilesSelected.map((filePath) => (
              <li key={filePath} className="mb-2 flex items-center justify-between">
                <span className="text-white">{filePath.split('/').pop()}</span>
                <button type="button" onClick={() => removeFile(filePath)} className="text-gray-400 hover:text-white">
                  ×
                </button>
              </li>
            ))}
          </ul>
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
