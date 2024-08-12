import React, { useState, DragEventHandler, useRef, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { createPortal } from 'react-dom'
import { Tab } from 'electron/main/electron-store/storeConfig'
import { removeFileExtension } from '@/utils/strings'
import '../../styles/tab.css'
import { useTabs } from '../Providers/TabProvider'
import NewNoteComponent from '../File/NewNote'
import { useModalOpeners } from '../Providers/ModalProvider'

interface DraggableTabsProps {
  currentFilePath: string
  openFileAndOpenEditor: (path: string) => void
  openAbsolutePath: (path: string) => void
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

const DraggableTabs: React.FC<DraggableTabsProps> = ({ currentFilePath, openFileAndOpenEditor, openAbsolutePath }) => {
  const { openTabs, addTab, selectTab, removeTabByID, updateTabOrder } = useTabs()
  const [isLastTabAccessed, setIsLastTabAccessed] = useState<boolean>(false)

  const fixedTabWidth = 200
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tabWidth, setTabWidth] = useState(200)
  const containerRef = useRef<HTMLDivElement>(null)

  const { isNewNoteModalOpen, setIsNewNoteModalOpen } = useModalOpeners()

  // Note: Do not put dependency on addTab or else removeTabByID does not work properly.
  // Typically you would define addTab inside the useEffect and then call it but since
  // we are using it inside a useContext we can remove it
  /* eslint-disable */
  useEffect(() => {
    if (!currentFilePath) return
    addTab(currentFilePath)
  }, [currentFilePath])
  /* eslint-enable */

  /*
   * Deals with setting which file to open on launch.
   */
  useEffect(() => {
    const selectLastTabAccessed = () => {
      if (!isLastTabAccessed) {
        openTabs.forEach((tab: Tab) => {
          if (tab.lastAccessed) {
            setIsLastTabAccessed(true)
            openFileAndOpenEditor(tab.filePath)
            return true
          }
          return false
        })
      }
    }

    selectLastTabAccessed()
  }, [openTabs, openFileAndOpenEditor, isLastTabAccessed])

  /* Calculates the width of each tab */
  useEffect(() => {
    const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 0
    const totalTabsWidth = openTabs.length * fixedTabWidth

    if (totalTabsWidth > containerWidth) {
      setTabWidth(containerWidth / openTabs.length)
    } else {
      setTabWidth(fixedTabWidth)
    }
  }, [openTabs.length])

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

  const handleTabSelect = (tab: Tab) => {
    selectTab(tab)
  }

  const handleTabClose = (event: React.MouseEvent<HTMLSpanElement, MouseEvent>, tabId: string) => {
    event.stopPropagation()
    removeTabByID(tabId)
  }

  return (
    <div ref={containerRef} className="flex w-full shrink-0 items-center whitespace-nowrap">
      {openTabs &&
        openTabs.map((tab) => (
          <div
            id="titleBarSingleTab"
            key={tab.id}
            className="flex h-[10px] animate-slide-in items-center justify-center"
            style={{ width: `${tabWidth}px` }}
            onMouseEnter={(e) => handleMouseEnter(e, tab)}
            onMouseLeave={handleMouseLevel}
          >
            <div
              data-tabid={tab.id}
              draggable="true"
              onDragStart={(event) => onDragStart(event, tab.id)}
              onDrop={onDrop}
              onDragOver={onDragOver}
              className={`relative flex w-full cursor-pointer items-center justify-between gap-1 p-2 text-sm text-white
              ${currentFilePath === tab.filePath ? 'rounded-md bg-dark-gray-c-three' : 'rounded-md'}`}
              onClick={() => handleTabSelect(tab)}
            >
              <span className="truncate">{removeFileExtension(tab.title)}</span>
              <span
                className="cursor-pointer px-1 hover:rounded-md hover:bg-dark-gray-c-five"
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering onClick of parent div
                  handleTabClose(e, tab.id)
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
          onClick={() => setIsNewNoteModalOpen(true)}
        >
          <FaPlus size={13} />
        </div>
      )}
      <NewNoteComponent
        isOpen={isNewNoteModalOpen}
        onClose={() => setIsNewNoteModalOpen(false)}
        openAbsolutePath={openAbsolutePath}
        currentOpenFilePath={currentFilePath}
      />
    </div>
  )
}

export default DraggableTabs
