import React, { useState, useEffect, ReactNode } from 'react'

import CustomSelect from '../Common/Select'

interface RagSettingsProps {
  children?: ReactNode // Define children prop
}
const RagSettings: React.FC<RagSettingsProps> = ({ children }) => {
  const [noOfRAGExamples, setNoOfRAGExamples] = useState<number | null>()

  useEffect(() => {
    const fetchData = async () => {
      const defaultNoOfRAGExamples = await window.electronStore.getNoOfRAGExamples()
      if (defaultNoOfRAGExamples) {
        setNoOfRAGExamples(defaultNoOfRAGExamples)
      } else {
        setNoOfRAGExamples(15)
        window.electronStore.setNoOfRAGExamples(15)
      }
    }

    fetchData()
  }, [])

  const handleChangeOnModelSelect = (ragExamples: string) => {
    const numberVersion = parseInt(ragExamples)
    setNoOfRAGExamples(numberVersion)
    window.electronStore.setNoOfRAGExamples(numberVersion)
  }

  const possibleNoOfExamples = Array.from({ length: 31 }, (_, i) => i)

  return (
    <div className="flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2">
      {children}
      {noOfRAGExamples && (
        <CustomSelect
          options={possibleNoOfExamples.map((num) => ({
            label: num.toString(),
            value: num.toString(),
          }))}
          selectedValue={noOfRAGExamples?.toString()}
          onChange={handleChangeOnModelSelect}
        />
      )}
    </div>
  )
}

export default RagSettings
