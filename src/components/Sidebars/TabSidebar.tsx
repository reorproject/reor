import React, { useState } from "react";
import { removeFileExtension } from "@/utils/strings";
import { FaPlus } from "react-icons/fa6";
import { createPortal } from "react-dom";
import "../../styles/tab.css";

interface DraggableTabsProps {
  openTabs: Tab[];
  onTabSelect: (tab: Tab) => void;
  onTabClose: (event: any, tabId: string) => void;
  currentFilePath: string;
  updateTabOrder: (draggedIndex: number, targetIndex: number) => void;
}

interface TooltipProps {
  filepath: string;
  position: { x: number; y: number };
}

const DraggableTabs: React.FC<DraggableTabsProps> = ({
  openTabs,
  onTabSelect,
  onTabClose,
  currentFilePath,
  updateTabOrder,
}) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const onDragStart = (event: any, tabId: string) => {
    event.dataTransfer.setData("tabId", tabId);
  };

  const onDrop = (event) => {
    event.preventDefault();
    const draggedTabId = event.dataTransfer.getData("tabId");

    let target = event.target;
    // Iterate each child until we find the one we moved to
    while (target && !target.getAttribute("data-tabid")) {
      target = target.parentElement;
    }

    const targetTabId = target ? target.getAttribute("data-tabid") : null;

    if (draggedTabId && targetTabId) {
      const draggedIndex = openTabs.findIndex((tab) => tab.id === draggedTabId);
      const targetIndex = openTabs.findIndex((tab) => tab.id === targetTabId);
      updateTabOrder(draggedIndex, targetIndex);
    }
  };

  const onDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleMouseEnter = (e, tab) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTab(tab.filePath);
    setTooltipPosition({
      x: rect.left - 75,
      y: rect.bottom - 5,
    });
  };

  const handleMouseLevel = () => {
    setHoveredTab(null);
  };

  return (
    <div className="flex whitespace-nowrap custom-scrollbar items-center relative">
      {openTabs.map((tab) => (
        <div
          id="titleBarSingleTab"
          key={tab.id}
          className="flex justify-center items-center h-[10px]"
          onMouseEnter={(e) => handleMouseEnter(e, tab)}
          onMouseLeave={handleMouseLevel}
        >
          <div
            data-tabid={tab.id}
            draggable="true"
            onDragStart={(event) => onDragStart(event, tab.id)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`relative py-2 px-2 text-white cursor-pointer flex justify-between gap-1 items-center text-sm w-[150px]
              ${
                currentFilePath === tab.filePath
                  ? "bg-dark-gray-c-three rounded-md"
                  : "rounded-md"
              }`}
            onClick={() => onTabSelect(tab)}
          >
            <span className="truncate">{removeFileExtension(tab.title)}</span>
            <span
              className="text-md cursor-pointer px-1 hover:bg-dark-gray-c-five hover:rounded-m"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onClick of parent div
                onTabClose(e, tab.id);
              }}
            >
              &times;
            </span>
            {hoveredTab === tab.filePath && (
              <Tooltip filepath={tab.filePath} position={tooltipPosition} />
            )}
          </div>
        </div>
      ))}
      {openTabs.length > 0 && (
        <div
          className="flex items-center justify-center px-2 hover:rounded-md hover:bg-dark-gray-c-three cursor-pointer text-white ml-1 h-[28px]"
          style={{ WebkitAppRegion: "no-drag" }}
          onClick={() => {
            window.electronUtils.showCreateFileModal();
          }}
        >
          <FaPlus size={13} />
        </div>
      )}
    </div>
  );
};

/* Displays the filepath when hovering on a tab */
const Tooltip: React.FC<TooltipProps> = ({ filepath, position }) => {
  return createPortal(
    <div
      className="tab-tooltip"
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
    >
      {filepath}
    </div>,
    document.getElementById("tooltip-container") as HTMLElement
  );
};

export { DraggableTabs };
