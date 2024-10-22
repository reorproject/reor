import React, { useState, useEffect, ReactNode } from 'react'
import posthog from 'posthog-js'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ChunkSizeSettingsProps {
  children?: ReactNode
}

const ChunkSizeSettings: React.FC<ChunkSizeSettingsProps> = ({ children }) => {
  const [chunkSize, setChunkSize] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const defaultChunkSize = await window.electronStore.getChunkSize()
      if (defaultChunkSize) {
        setChunkSize(defaultChunkSize)
      } else {
        setChunkSize(500) // Default value
        window.electronStore.setChunkSize(500)
      }
    }

    fetchData()
  }, [])

  const handleChangeOnChunkSizeSelect = (size: string) => {
    const numberVersion = parseInt(size, 10)
    setChunkSize(numberVersion)
    window.electronStore.setChunkSize(numberVersion)
    posthog.capture('change_chunk_size', {
      chunkSize: numberVersion,
    })
  }

  const possibleChunkSizes = Array.from({ length: 20 }, (_, i) => (i + 1) * 100)

  return (
    <div className="flex w-full items-center justify-between gap-5 border-0 border-b-2 border-solid border-neutral-700 pb-2 pt-3">
      {children}
      {chunkSize && (
        <div className="w-[140px]">
          <Select onValueChange={handleChangeOnChunkSizeSelect} value={chunkSize.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Select chunk size" />
            </SelectTrigger>
            <SelectContent>
              {possibleChunkSizes.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

export default ChunkSizeSettings
