import React from "react";

interface DraggableTabsProps {
  openTabs: Tab[];
  setOpenTabs: (openTabs: Tab[]) => void;
  onTabSelect: (path: string) => void;
  onTabClose: (tabId) => void;
  currentFilePath: (path: string) => void;
}

const DraggableTabs: React.FC<DraggableTabsProps> = ({
  openTabs,
  setOpenTabs,
  onTabSelect,
  onTabClose,
  currentFilePath,
}) => {
  const onDragStart = (event, tabId) => {
    event.dataTransfer.setData("tabId", tabId);
  };

  const onDrop = (event) => {
    const draggedTabId = event.dataTransfer.getData("tabId");
    const targetTabId = event.target.getAttribute("data-tabid");
    const newTabs = [...openTabs];
    const draggedTab = newTabs.find((tab) => tab.id === draggedTabId);
    const targetIndex = newTabs.findIndex((tab) => tab.id === targetTabId);

    newTabs.splice(newTabs.indexOf(draggedTab), 1); // Remove the dragged tab
    newTabs.splice(targetIndex, 0, draggedTab); // Insert at the new index

    setOpenTabs(newTabs);
  };

  const onDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex">
      {openTabs.map((tab) => (
        <div
          key={tab.id}
          data-tabid={tab.id}
          draggable="true"
          onDragStart={(event) => onDragStart(event, tab.id)}
          onDrop={onDrop}
          onDragOver={onDragOver}
          className={`mx-2 py-1 bg-transparent text-white cursor-pointer ${
            currentFilePath === tab.filePath
              ? "border-solid border-0 border-b-2 border-yellow-300"
              : ""
          }`}
          onClick={() => onTabSelect(tab.filePath)}
        >
          {tab.title}
          <span className="ml-1" onClick={() => onTabClose(tab.id)}>
            &times;
          </span>
        </div>
      ))}
    </div>
  );
};

export { DraggableTabs };
