import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Slider from '@mui/material/Slider'
import { sub } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { List, ListItem } from '@material-tailwind/react'
import FolderIcon from '@mui/icons-material/Folder'
import { ListItemIcon, ListItemText, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
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

  const filteredFiles = useMemo(
    () => memoizedFlattenedFiles.filter((file) => file.path.toLowerCase().includes(searchText.toLowerCase())),
    [memoizedFlattenedFiles, searchText],
  )

  const toggleFileSelection = useCallback((filePath: string) => {
    setInternalFilesSelected((prev) =>
      prev.includes(filePath) ? prev.filter((f) => f !== filePath) : [...prev, filePath],
    )
  }, [])

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
      ref={popupRef}
      className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-neutral-900 p-6 shadow-xl"
      onClick={stopPropagation}
    >
      <h4 className="mb-4 text-center text-2xl text-white">
        Choose specific context files or customise the RAG search
      </h4>
      {type === 'files' && (
        <div>
          <h3 className="mb-2 text-lg text-white">Select files for context</h3>
          <div className="mb-4">
            <input
              type="text"
              className="w-full rounded-md border border-gray-600 bg-neutral-800 px-4 py-2 text-white placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchText}
              onChange={(e) => handleSearchTextChange(e.target.value)}
              placeholder="Search for files by name"
            />
          </div>
          {searchText && (
            <div className="mb-4 h-60 overflow-y-auto rounded-md bg-neutral-800 p-2 shadow-lg">
              {filteredFiles.map((file) => (
                <div
                  key={file.path}
                  className="group flex cursor-pointer items-center space-x-2 p-2 transition-colors duration-150 hover:bg-neutral-700"
                  onClick={() => toggleFileSelection(file.path)}
                >
                  <div
                    className={`size-4 shrink-0 rounded border ${
                      internalFilesSelected.includes(file.path)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400 group-hover:border-blue-400'
                    }`}
                  >
                    {internalFilesSelected.includes(file.path) && (
                      <svg className="m-auto size-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <InsertDriveFileIcon className="shrink-0 text-blue-400" />
                      <span className="truncate text-sm text-white">{file.path.split('/').pop()}</span>
                    </div>
                    <span className="block truncate text-xs text-gray-400">{file.path}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 max-h-[300px] w-full overflow-y-auto rounded-md bg-neutral-800 p-2 text-white">
            <List placeholder="">
              {internalFilesSelected.map((filePath) => (
                <ListItem
                  key={filePath}
                  placeholder=""
                  className="flex items-center justify-between rounded-md p-2 transition-colors duration-150 hover:bg-neutral-700"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <ListItemIcon>
                      <FolderIcon className="text-blue-600" />
                    </ListItemIcon>
                    <ListItemText primary={filePath} className="truncate" />
                  </div>
                  <IconButton
                    onClick={() => removeFile(filePath)}
                    size="small"
                    className="text-gray-400 transition-colors duration-150 hover:text-white"
                  >
                    <CloseIcon className="text-gray-400 hover:text-red-500" fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      )}
      {type === 'items' && (
        <div>
          <h3 className="mb-2 text-lg text-white">Context settings</h3>
          <div className="mb-4 text-white">
            <p>Number of notes to add to context:</p>
            <div className="mt-2 w-full rounded bg-neutral-800 p-4 pb-2">
              <Slider
                value={numberOfChunksToFetch}
                onChange={handleNumItemsChange}
                min={0}
                max={30}
                step={1}
                marks={marks}
                valueLabelDisplay="auto"
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
                  '& .MuiSlider-valueLabel': {
                    fontSize: '0.75rem',
                    padding: '3px 6px',
                    lineHeight: '1.2em',
                  },
                  '& .MuiSlider-markLabel': {
                    color: '#FFFFFF',
                  },
                }}
              />
            </div>
            <div className="mt-2 text-center">{numberOfChunksToFetch}</div>
          </div>
        </div>
      )}
      {type === 'date' && (
        <div>
          <h3 className="mb-2 text-lg text-white">Filter context notes by last modified date:</h3>
          <div className="mt-2 w-full rounded pb-1">
            <CustomSelect
              options={dateRangeOptions}
              selectedValue={selectedDateRange}
              onChange={handleDateRangeChange}
            />
          </div>
          <div
            className="mb-2 cursor-pointer text-xs text-gray-500 underline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
          </div>
          {showAdvanced && (
            <div className="mt-2 flex flex-col items-center space-x-4">
              <div className="flex h-[400px] w-[300px] flex-col items-center overflow-hidden text-white">
                <p className="mb-1">Min Date:</p>
                <DayPicker
                  selected={minDate}
                  onSelect={(date) => setMinDate(date || undefined)}
                  mode="single"
                  className="my-day-picker size-full"
                />
              </div>
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
