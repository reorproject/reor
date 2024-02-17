import { FileInfoNode, FileInfoTree } from "electron/main/Files/Types";

export const sortFilesAndDirectories = (
  fileList: FileInfoTree
): FileInfoTree => {
  fileList.sort((a, b) => {
    const aIsDirectory = isFileNodeDirectory(a);
    const bIsDirectory = isFileNodeDirectory(b);

    // Both are directories: sort alphabetically
    if (aIsDirectory && bIsDirectory) {
      return a.name.localeCompare(b.name);
    }

    // One is a directory and the other is a file
    if (aIsDirectory && !bIsDirectory) {
      return -1;
    }
    if (!aIsDirectory && bIsDirectory) {
      return 1;
    }

    // Both are files: sort by dateModified
    return b.dateModified.getTime() - a.dateModified.getTime();
  });

  fileList.forEach((fileInfoNode) => {
    // If a node has children, sort them recursively
    if (fileInfoNode.children && fileInfoNode.children.length > 0) {
      sortFilesAndDirectories(fileInfoNode.children);
    }
  });

  return fileList;
};

export const isFileNodeDirectory = (fileInfo: FileInfoNode): boolean => {
  return fileInfo.children !== undefined;
};
