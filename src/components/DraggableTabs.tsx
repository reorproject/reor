import React from "react";

interface DraggableTabsProps {
  openTabs: Tab[];
  setOpenTabs: (openTabs: Tab[]) => void;
  onTabSelect: (path: string) => void;
  onTabClose: (event: any, tabId: string) => void;
  currentFilePath: string;
}

const DraggableTabs: React.FC<DraggableTabsProps> = ({
  openTabs,
  setOpenTabs,
  onTabSelect,
  onTabClose,
  currentFilePath,
}) => {
  console.log("OpenTabs:", openTabs);
  const onDragStart = (event: any, tabId: string) => {
    event.dataTransfer.setData("tabId", tabId);
  };

  const onDrop = (event: any) => {
    const draggedTabId = event.dataTransfer.getData("tabId");
    const targetTabId = event.target.getAttribute("data-tabid");
    const newTabs = [...openTabs];
    const draggedTab = newTabs.find((tab) => tab.id === draggedTabId);
    const targetIndex = newTabs.findIndex((tab) => tab.id === targetTabId);
    const draggedIndex = newTabs.indexOf(draggedTab);

    newTabs.splice(draggedIndex, 1); // Remove the dragged tab
    newTabs.splice(targetIndex, 0, draggedTab); // Insert at the new index

    console.log(`Dragged: ${draggedIndex}, Target: ${targetIndex}`);
    syncTabsWithBackend(draggedIndex, targetIndex);
    setOpenTabs(newTabs);
  };

  /* Sync New tab update with backened */
  const syncTabsWithBackend = (draggedIndex: number, targetIndex: number) => {
    window.electronStore.setCurrentOpenFiles("update", {
      draggedIndex: draggedIndex,
      targetIndex: targetIndex,
    });
  };

  const onDragOver = (event: any) => {
    event.preventDefault();
  };

  return (
    <div className="flex whitespace-nowrap custom-scrollbar">
      {openTabs.map((tab) => (
        <div
          key={tab.id}
          className="flex justify-center items-center bg-dark-gray-c-ten h-[28px]"
        >
          <div
            data-tabid={tab.id}
            draggable="true"
            onDragStart={(event) => onDragStart(event, tab.id)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            className={`py-4 px-2 text-white cursor-pointer flex justify-center gap-1 items-center text-sm ${
              currentFilePath === tab.filePath ? "bg-dark-gray-c-three" : ""
            }`}
            onClick={() => onTabSelect(tab.filePath)}
          >
            {tab.title}
            <span
              className="text-md cursor-pointer px-1 hover:bg-dark-gray-c-five hover:rounded-md"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering onClick of parent div
                onTabClose(e, tab.id);
              }}
            >
              &times;
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export { DraggableTabs };
