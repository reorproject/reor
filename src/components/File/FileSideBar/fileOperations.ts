import { FileInfoNode, FileInfoTree } from "electron/main/filesystem/Types";

export const sortFilesAndDirectories = (
  fileList: FileInfoTree,
  currentFilePath: string | null
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

    // if current file path is not null and one of the files is the current file path, then it should be sorted as the first file after all directories
    if (currentFilePath !== null) {
      if (a.path === currentFilePath) {
        return -1;
      }
      if (b.path === currentFilePath) {
        return 1;
      }
    }

    // Both are files: sort by dateModified
    return b.dateModified.getTime() - a.dateModified.getTime();
  });

  fileList.forEach((fileInfoNode) => {
    // If a node has children, sort them recursively
    if (fileInfoNode.children && fileInfoNode.children.length > 0) {
      sortFilesAndDirectories(fileInfoNode.children, currentFilePath);
    }
  });

  return fileList;
};

export const isFileNodeDirectory = (fileInfo: FileInfoNode): boolean => {
  return fileInfo.children !== undefined;
};

export const moveFile = async (sourcePath: string, destinationPath: string) => {
  await window.fileSystem.moveFileOrDir(sourcePath, destinationPath);
};
