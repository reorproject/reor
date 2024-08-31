import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChatFilters } from './types'
import ContextSettingsPopup from './ContextSettingsPopup'

interface ContextSettingsBarProps {
  chatFilters: ChatFilters
  setChatFilters: React.Dispatch<React.SetStateAction<ChatFilters>>
  vaultDirectory: string
}

const ContextSettingsBar: React.FC<ContextSettingsBarProps> = ({ chatFilters, setChatFilters, vaultDirectory }) => {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)

  const handleTooltipClick = useCallback((tooltipType: string) => {
    setOpenTooltip((prev) => (prev === tooltipType ? null : tooltipType))
  }, [])

  const renderPopup = (type: string) => {
    if (openTooltip !== type) return null

    return createPortal(
      <ContextSettingsPopup
        type={type}
        chatFilters={chatFilters}
        setChatFilters={(newSettings: Partial<ChatFilters>) => setChatFilters((prev) => ({ ...prev, ...newSettings }))}
        onClose={() => setOpenTooltip(null)}
        vaultDirectory={vaultDirectory}
      />,
      document.body,
    )
  }

  return (
    <div className="flex w-full max-w-3xl items-center justify-between bg-gray-800 p-2 text-sm text-white">
      <div className="cursor-pointer" onClick={() => handleTooltipClick('files')}>
        Files added to context: {chatFilters.files.length}
      </div>
      <div className="cursor-pointer" onClick={() => handleTooltipClick('items')}>
        Number of context notes: {chatFilters.numItems}
      </div>
      <div className="cursor-pointer" onClick={() => handleTooltipClick('date')}>
        Date filter: {chatFilters.dateFilter}
      </div>
      {renderPopup('files')}
      {renderPopup('items')}
      {renderPopup('date')}
    </div>
  )
}

export default ContextSettingsBar
