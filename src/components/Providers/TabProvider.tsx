import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { removeFileExtension } from "../../utils/strings";

const TabContext = createContext();

export const useTabs = () => useContext(TabContext);

export const TabProvider = ({
  children,
  openFileAndOpenEditor,
  setFilePath,
  currentFilePath,
  editor,
}) => {
  const [openTabs, setOpenTabs] = useState([]);

  useEffect(() => {
    const fetchHistoryTabs = async () => {
      // await window.electronStore.setCurrentOpenFiles("clear");
      const response = await window.electronStore.getCurrentOpenFiles();
      setOpenTabs(response);
    };

    fetchHistoryTabs();
  }, []);

  const syncTabsWithBackend = async (action, args) => {
    await window.electronStore.setCurrentOpenFiles(action, args);
  };

  /* Adds a new tab and syncs it with the backend */
  const addTab = (path: string) => {
    const existingTab = openTabs.find((tab) => tab.filePath === path);
    if (existingTab) return;
    const tab = createTabObjectFromPath(path);

    setOpenTabs((prevTabs) => {
      const newTabs = [...prevTabs, tab];
      syncTabsWithBackend("add", { tab: tab });
      return newTabs;
    });
  };

  /* Removes a tab and syncs it with the backend */
  const removeTab = (tabId) => {
    let closedFilePath = "";
    let newIndex = -1;

    setOpenTabs((prevTabs) => {
      const index = prevTabs.findIndex((tab) => tab.id === tabId);
      prevTabs[index].lastAccessed = false;
      closedFilePath = index !== -1 ? prevTabs[index].filePath : "";
      newIndex = index > 0 ? index - 1 : 1;
      if (closedFilePath === currentFilePath) {
        if (newIndex < openTabs.length) {
          openTabs[newIndex].lastAccessed = true;
          openFileAndOpenEditor(openTabs[newIndex].filePath);
        }
        // Select the new index's file
        else setFilePath(null);
      }
      return prevTabs.filter((tab, idx) => idx !== index);
    });
    window.electronStore.setCurrentOpenFiles("remove", {
      tabId: tabId,
    });
  };

  /* Updates tab order (on drag) and syncs it with backend */
  const updateTabOrder = (draggedIndex, targetIndex) => {
    setOpenTabs((prevTabs) => {
      const newTabs = [...prevTabs];
      const [draggedTab] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(targetIndex, 0, draggedTab);
      // console.log(`Dragged ${draggedIndex}, target ${targetIndex}`);
      syncTabsWithBackend("update", {
        draggedIndex: draggedIndex,
        targetIndex: targetIndex,
      });
      return newTabs;
    });
  };

  /* Selects a tab and syncs it with the backend */
  const selectTab = (selectedTab) => {
    setOpenTabs((prevTabs) => {
      const newTabs = prevTabs.map((tab) => ({
        ...tab,
        lastAccessed: tab.id === selectedTab.id,
      }));
      syncTabsWithBackend("select", { tabs: newTabs });
      return newTabs;
    });
    openFileAndOpenEditor(selectedTab.filePath);
  };

  const extractFileName = (path: string) => {
    const parts = path.split(/[/\\]/); // Split on both forward slash and backslash
    return parts.pop(); // Returns the last element, which is the file name
  };

  const createTabObjectFromPath = (path: string) => {
    return {
      id: uuidv4(),
      filePath: path,
      title: extractFileName(path),
      lastAccessed: true,
      // timeOpened: new Date(),
      // isDirty: false,
    };
  };

  return (
    <TabContext.Provider
      value={{ openTabs, addTab, removeTab, updateTabOrder, selectTab }}
    >
      {children}
    </TabContext.Provider>
  );
};
