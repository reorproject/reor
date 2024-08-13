import React, { useEffect, useRef, useState } from 'react'

import { FaTrash } from 'react-icons/fa'

type OptionType = {
  label: string
  value: string
}

type CustomSelectProps = {
  options: OptionType[]
  selectedValue: string
  onChange: (value: string) => void
  addButton?: {
    label: string
    onClick: () => void
  }
  onDelete?: (value: string) => void
  centerText?: boolean
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  selectedValue,
  onChange,
  addButton,
  onDelete,
  centerText = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [wrapperRef])

  const toggleDropdown = () => setIsOpen(!isOpen)
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleDeleteModelInDropdown = async (selectedModel: string) => {
    if (onDelete) {
      onDelete(selectedModel)
      setIsOpen(false)
    }
  }

  return (
    <div className="flex w-full" ref={wrapperRef}>
      <div
        className="flex w-full cursor-pointer items-center  justify-between rounded-md border border-gray-300 bg-dark-gray-c-eight py-2 hover:bg-dark-gray-c-ten"
        onClick={toggleDropdown}
      >
        {centerText ? <span /> : null}
        <span className="px-2 text-[13px] text-gray-100">{selectedValue}</span>
        <span className="mr-2 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
          &#9660;
        </span>
      </div>
      {isOpen && (
        <div
          className="absolute z-10 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white text-[13px] text-gray-600 shadow-lg"
          style={{
            position: 'fixed',
            top: 'auto',
            left: wrapperRef.current?.getBoundingClientRect().left,
            width: wrapperRef.current?.getBoundingClientRect().width,
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              className="flex cursor-pointer items-center justify-between bg-dark-gray-c-eight py-2 pl-6 pr-2 text-white hover:bg-dark-gray-c-ten "
              onClick={() => handleOptionClick(option.value)}
            >
              <span className="w-full">{option.label}</span>
              {selectedValue === option.value && <span className="text-blue-500">&#10003;</span>}
              {selectedValue !== option.value && onDelete && (
                <span
                  onClick={() => handleDeleteModelInDropdown(option.value)}
                  className="ml-2 text-[13px] text-red-700"
                >
                  <FaTrash />
                </span>
              )}
            </div>
          ))}

          {addButton && (
            <div
              className="mt-1 cursor-pointer rounded-md bg-neutral-200 p-2 text-center text-gray-700 shadow-sm transition-colors hover:bg-neutral-300"
              onClick={addButton.onClick}
            >
              {addButton.label}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CustomSelect
