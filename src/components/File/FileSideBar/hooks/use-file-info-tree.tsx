import { useEffect, useState } from "react";

import {
  FileInfo,
  FileInfoNode,
  FileInfoTree,
} from "electron/main/filesystem/Types";

import { sortFilesAndDirectories } from "../fileOperations";

export const useFileInfoTree = (currentFilePath: string | null) => {
  const [fileInfoTree, setFileInfoTree] = useState<FileInfoTree>([]);
  const [flattenedFiles, setFlattenedFiles] = useState<FileInfo[]>([]);
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
      const sortedFiles = sortFilesAndDirectories(updatedFiles, null);
      setFileInfoTree(sortedFiles);
      const flattenedFiles = flattenFileInfoTree(sortedFiles);
      setFlattenedFiles(flattenedFiles);
      const directoriesToBeExpanded = findRelevantDirectoriesToBeOpened();
      setExpandedDirectories(directoriesToBeExpanded);
    };

    const removeFilesListListener = window.ipcRenderer.receive(
      "files-list",
      handleFileUpdate
    );

    return () => {
      removeFilesListListener();
    };
  }, [currentFilePath]);

  //initial load of files
  useEffect(() => {
    const fetchAndSetFiles = async () => {
      try {
        const fetchedFiles = await window.fileSystem.getFilesTreeForWindow();
        const sortedFiles = sortFilesAndDirectories(fetchedFiles, null);
        setFileInfoTree(sortedFiles);
        const flattenedFiles = flattenFileInfoTree(sortedFiles);
        setFlattenedFiles(flattenedFiles);
      } catch (error) {
        console.error("Error fetching and setting files:", error);
      }
    };

    fetchAndSetFiles();
  }, []);

  return {
    files: fileInfoTree,
    flattenedFiles,
    expandedDirectories,
    handleDirectoryToggle,
  };
};

// Duplicate function in the main process. It'll be faster to call this function here rahter than sending an IPC message to the main process.
export function flattenFileInfoTree(tree: FileInfoTree): FileInfo[] {
  let flatList: FileInfo[] = [];

  for (const node of tree) {
    if (!isFileNodeDirectory(node)) {
      flatList.push({
        name: node.name,
        path: node.path,
        relativePath: node.relativePath,
        dateModified: node.dateModified,
        dateCreated: node.dateCreated,
      });
    }

    if (isFileNodeDirectory(node) && node.children) {
      flatList = flatList.concat(flattenFileInfoTree(node.children));
    }
  }

  return flatList;
}

export const isFileNodeDirectory = (fileInfo: FileInfoNode): boolean => {
  return fileInfo.children !== undefined;
};
