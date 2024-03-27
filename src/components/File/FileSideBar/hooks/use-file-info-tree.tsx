import { useEffect, useState } from "react";
import { sortFilesAndDirectories } from "../fileOperations";
import { FileInfoTree } from "electron/main/Files/Types";

export const useFileInfoTree = (currentFilePath: string | null) => {
  const [fileInfoTree, setFileInfoTree] = useState<FileInfoTree>([]);
  const [expandedDirectories, setExpandedDirectories] = useState<
    Map<string, boolean>
  >(new Map());

  // find relevant directories that are opened, progressively building for each directory but removing last line
  const findRelevantDirectoriesToBeOpened = () => {
    if (currentFilePath === null) {
      return expandedDirectories;
    }
    const pathSegments = currentFilePath
      .split("/")
      .filter((segment) => segment !== "");
    pathSegments.pop(); // Remove the file name from the path

    let currentPath = "";
    const newExpandedDirectories = new Map(expandedDirectories);
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      newExpandedDirectories.set(currentPath, true);
    });

    return newExpandedDirectories;
  };

  const handleDirectoryToggle = (path: string) => {
    const isExpanded = expandedDirectories.get(path);
    const newExpandedDirectories = new Map(expandedDirectories);
    newExpandedDirectories.set(path, !isExpanded);
    setExpandedDirectories(newExpandedDirectories);
  };

  //upon indexing, update the file info tree and expand relevant directories
  useEffect(() => {
    const handleFileUpdate = (updatedFiles: FileInfoTree) => {
      const sortedFiles = sortFilesAndDirectories(
        updatedFiles,
        currentFilePath
      );
      setFileInfoTree(sortedFiles);
      const directoriesToBeExpanded = findRelevantDirectoriesToBeOpened();
      setExpandedDirectories(directoriesToBeExpanded);
    };

    window.ipcRenderer.receive("files-list", handleFileUpdate);

    return () => {
      window.ipcRenderer.removeListener("files-list", handleFileUpdate);
    };
  }, [currentFilePath]);

  //initial load of files
  useEffect(() => {
    window.files.getFilesForWindow().then((fetchedFiles) => {
      const sortedFiles = sortFilesAndDirectories(
        fetchedFiles,
        currentFilePath
      );
      setFileInfoTree(sortedFiles);
    });
  }, []);

  return {
    files: fileInfoTree,
    expandedDirectories,
    handleDirectoryToggle,
  };
};
