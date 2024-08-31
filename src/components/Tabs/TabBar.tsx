import React, { useState, DragEventHandler, useRef, useEffect } from 'react'
import { FaPlus } from 'react-icons/fa6'
import { createPortal } from 'react-dom'
import { Tab } from 'electron/main/electron-store/storeConfig'
import { removeFileExtension } from '@/utils/strings'
import '../../styles/tab.css'
import { useTabs } from '../../contexts/TabContext'
import NewNoteComponent from '../File/NewNote'
import { useModalOpeners } from '../../contexts/ModalContext'
import { useChatContext } from '@/contexts/ChatContext'

interface TooltipProps {
  filepath: string
  position: { x: number; y: number }
}

/* Displays the filepath when hovering on a tab */
const Tooltip: React.FC<TooltipProps> = ({ filepath, position }) => {
  const [style, setStyle] = useState({ top: 0, left: 0, maxWidth: '300px' })

  useEffect(() => {
    const viewportWidth = window.innerWidth
    let maxWidth = '300px'

    if (position.x && viewportWidth) {
      const availableWidth = viewportWidth - position.x - 10
      maxWidth = `${availableWidth}px`
    }

    setStyle({
      top: position.y,
      left: position.x,
      maxWidth,
    })
  }, [position])

  return createPortal(
    <div className="tab-tooltip" style={style}>
      {filepath}
    </div>,
    document.getElementById('tooltip-container') as HTMLElement,
  )
}

const DraggableTabs: React.FC = () => {
  const { currentTab, openTabContent } = useChatContext()
  const { openTabs, addTab, selectTab, removeTabByID, updateTabOrder } = useTabs()
  const [isLastTabAccessed, setIsLastTabAccessed] = useState<boolean>(false)

  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const { isNewNoteModalOpen, setIsNewNoteModalOpen } = useModalOpeners()

  // Note: Do not put dependency on addTab or else removeTabByID does not work properly.
  // Typically you would define addTab inside the useEffect and then call it but since
  // we are using it inside a useContext we can remove it
  /* eslint-disable */
  useEffect(() => {
    if (!currentTab) return
    addTab(currentTab)
  }, [currentTab])
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
            openTabContent(tab.path)
            return true
          }
          return false
        })
      }
    }

    selectLastTabAccessed()
  }, [openTabs, openTabContent, isLastTabAccessed])

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
    setHoveredTab(tab.path)
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
    <div ref={containerRef} className="flex max-w-full items-center whitespace-nowrap">
      <div className="flex min-w-0 grow">
        {openTabs &&
          openTabs.map((tab) => (
            <div
              id="titleBarSingleTab"
              key={tab.id}
              className="flex h-[10px] min-w-0 max-w-[150px] grow animate-slide-in items-center justify-center"
              onMouseEnter={(e) => handleMouseEnter(e, tab)}
              onMouseLeave={handleMouseLevel}
            >
              <div
                data-tabid={tab.id}
                draggable="true"
                onDragStart={(event) => onDragStart(event, tab.id)}
                onDrop={onDrop}
                onDragOver={onDragOver}
                className={`relative flex w-full cursor-pointer items-center justify-between gap-1 rounded-md p-2 text-sm text-white
                ${currentTab === tab.path ? 'bg-dark-gray-c-eleven' : ''}`}
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
                {hoveredTab === tab.path && <Tooltip filepath={tab.path} position={tooltipPosition} />}
              </div>
            </div>
          ))}
      </div>
      {openTabs.length > 0 && (
        <div
          id="titleBarFileNavigator"
          className="ml-1 mr-10 flex h-[28px] cursor-pointer items-center justify-center px-2 text-white hover:rounded-md hover:bg-dark-gray-c-one"
          onClick={() => setIsNewNoteModalOpen(true)}
        >
          <FaPlus size={13} />
        </div>
      )}
      <NewNoteComponent isOpen={isNewNoteModalOpen} onClose={() => setIsNewNoteModalOpen(false)} />
    </div>
  )
}

export default DraggableTabs
