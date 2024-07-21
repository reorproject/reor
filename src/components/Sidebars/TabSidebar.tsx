import React, { useState, DragEventHandler } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { createPortal } from 'react-dom'
import { removeFileExtension } from '@/utils/strings'
import '../../styles/tab.css'
import { Tab } from '../Providers/TabProvider'

interface DraggableTabsProps {
  openTabs: Tab[]
  onTabSelect: (tab: Tab) => void
  onTabClose: (event: any, tabId: string) => void
  currentFilePath: string
  updateTabOrder: (draggedIndex: number, targetIndex: number) => void
}

interface TooltipProps {
  filepath: string
  position: { x: number; y: number }
}

/* Displays the filepath when hovering on a tab */
const Tooltip: React.FC<TooltipProps> = ({ filepath, position }) => {
  return createPortal(
    <div className="tab-tooltip" style={{ top: `${position.y}px`, left: `${position.x}px` }}>
      {filepath}
    </div>,
    document.getElementById('tooltip-container') as HTMLElement,
  )
}

const DraggableTabs: React.FC<DraggableTabsProps> = ({
  openTabs,
  onTabSelect,
  onTabClose,
  currentFilePath,
  updateTabOrder,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const onDragStart = (event: any, tabId: string) => {
    event.dataTransfer.setData('tabId', tabId)
  }

  const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
    const draggedTabId = event.dataTransfer.getData('tabId')

    let target = event.target as HTMLElement | null
    // Iterate each child until we find the one we moved to
    while (target && !target.getAttribute('data-tabid')) {
      target = target.parentElement as HTMLElement | null
    }

    const targetTabId = target ? target.getAttribute('data-tabid') : null

    if (draggedTabId && targetTabId) {
      const draggedIndex = openTabs.findIndex((tab) => tab.id === draggedTabId)
      const targetIndex = openTabs.findIndex((tab) => tab.id === targetTabId)
      updateTabOrder(draggedIndex, targetIndex)
    }
  }

  const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault()
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, tab: Tab) => {
    const rect = e.currentTarget.getBoundingClientRect() || null
    setHoveredTab(tab.filePath)
    setTooltipPosition({
      x: rect.left - 75,
      y: rect.bottom - 5,
    })
  }

  const handleMouseLevel = () => {
    setHoveredTab(null)
  }

  return (
    <div className="relative flex items-center whitespace-nowrap">
      {openTabs.map((tab) => (
        <div
          id="titleBarSingleTab"
          key={tab.id}
          className="flex h-[10px] items-center justify-center"
          onMouseEnter={(e) => handleMouseEnter(e, tab)}
          onMouseLeave={handleMouseLevel}
        >
          <div
            data-tabid={tab.id}
            draggable="true"
            onDragStart={(event) => onDragStart(event, tab.id)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`relative flex w-[150px] cursor-pointer items-center justify-between gap-1 p-2 text-sm text-white
              ${currentFilePath === tab.filePath ? 'rounded-md bg-dark-gray-c-three' : 'rounded-md'}`}
            onClick={() => onTabSelect(tab)}
          >
            <span className="truncate">{removeFileExtension(tab.title)}</span>
            <span
              className="cursor-pointer px-1 hover:rounded-md hover:bg-dark-gray-c-five"
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering onClick of parent div
                onTabClose(e, tab.id)
              }}
            >
              &times;
            </span>
            {hoveredTab === tab.filePath && <Tooltip filepath={tab.filePath} position={tooltipPosition} />}
          </div>
        </div>
      ))}
      {openTabs.length > 0 && (
        <div
          id="titleBarFileNavigator"
          className="ml-1 flex h-[28px] cursor-pointer items-center justify-center px-2 text-white hover:rounded-md hover:bg-dark-gray-c-three"
          onClick={() => {
            window.electronUtils.showCreateFileModal('')
          }}
        >
          <FaPlus size={13} />
        </div>
      )}
    </div>
  )
}

export default DraggableTabs
