import path from "path";
import fs from "fs";
import { FileInfo, FileInfoNode, FileInfoTree } from "./Types";
import chokidar from "chokidar";
import { BrowserWindow } from "electron";
import {
  RagnoteTable,
  addTreeToTable,
  removeTreeFromTable,
} from "../embeddings/Table";

export function GetFilesInfoList(
  directory: string,
  extensions?: string[]
): FileInfo[] {
  const fileInfoTree = GetFilesInfoTree(directory, extensions);
  const fileInfoList = flattenFileInfoTree(fileInfoTree);
  return fileInfoList;
}

export function GetFilesInfoTree(
  pathInput: string,
  extensions?: string[],
  parentRelativePath: string = ""
): FileInfoTree {
  let fileInfoTree: FileInfoTree = [];

  if (!fs.existsSync(pathInput)) {
    console.error("Path does not exist:", pathInput);
    return fileInfoTree;
  }

  try {
    const stats = fs.statSync(pathInput);

    if (stats.isFile()) {
      const fileExtension = path.extname(pathInput).toLowerCase();
      if ((extensions && extensions.includes(fileExtension)) || !extensions) {
        fileInfoTree.push({
          name: path.basename(pathInput),
          path: pathInput,
          relativePath: parentRelativePath,
          dateModified: stats.mtime,
          type: "file",
        });
      }
      return fileInfoTree;
    }

    const items = fs.readdirSync(pathInput);

    items.forEach((item) => {
      const itemPath = path.join(pathInput, item);
      const relativePath = path.join(parentRelativePath, item);

      try {
        const itemStats = fs.statSync(itemPath);

        if (itemStats.isDirectory()) {
          const children = GetFilesInfoTree(itemPath, extensions, relativePath);
          fileInfoTree.push({
            name: item,
            path: itemPath,
            relativePath: relativePath,
            dateModified: itemStats.mtime,
            type: "directory",
            children: children,
          });
        } else {
          const fileExtension = path.extname(item).toLowerCase();

          if (
            (extensions && extensions.includes(fileExtension)) ||
            (!extensions && fileExtension)
          ) {
            fileInfoTree.push({
              name: item,
              path: itemPath,
              relativePath: relativePath,
              dateModified: itemStats.mtime,
              type: "file",
            });
          }
        }
      } catch (error) {
        console.error(`Error accessing ${itemPath}:`, error);
      }
    });
  } catch (error) {
    console.error(`Error accessing ${pathInput}:`, error);
  }

  return fileInfoTree;
}

export function flattenFileInfoTree(tree: FileInfoTree): FileInfo[] {
  let flatList: FileInfo[] = [];

  for (const node of tree) {
    if (node.type === "file") {
      flatList.push({
        name: node.name,
        path: node.path,
        relativePath: node.relativePath,
        dateModified: node.dateModified,
      });
    }

    if (node.type === "directory" && node.children) {
      flatList = flatList.concat(flattenFileInfoTree(node.children));
    }
  }

  return flatList;
}

export function writeFileSyncRecursive(
  filePath: string,
  content: string,
  charset: BufferEncoding
): void {
  // Ensures that the directory exists. If the directory structure does not exist, it is created.
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  fs.writeFileSync(filePath, content, charset);
}

export function startWatchingDirectory(
  win: BrowserWindow,
  directory: string,
  extensions?: string[]
): void {
  try {
    const watcher = chokidar.watch(directory, {
      ignoreInitial: true,
    });

    watcher.on("add", (path) => {
      // Check if the file extension is in the provided list (if any)
      if (
        !extensions ||
        extensions.some((ext) => path.toLowerCase().endsWith(ext.toLowerCase()))
      ) {
        console.log(`File added: ${path}`);
        updateFileListForRenderer(win, directory);
      }
    });

    // Handle other events like 'change', 'unlink' if needed

    // No 'ready' event handler is needed here, as we're ignoring initial scan
  } catch (error) {
    console.error("Error setting up file watcher:", error);
  }
}

export function updateFileListForRenderer(
  win: BrowserWindow,
  directory: string,
  fileExtensions?: string[]
): void {
  const files = GetFilesInfoTree(directory, fileExtensions);
  if (win) {
    win.webContents.send("files-list", files);
  }
}

export const orchestrateEntryMove = async (
  table: RagnoteTable,
  sourcePath: string,
  destinationPath: string,
  extensions?: string[]
) => {
  const fileSystemTree = GetFilesInfoTree(sourcePath, extensions);
  await removeTreeFromTable(table, fileSystemTree);
  const newDestinationPath = moveFileOrDirectoryInFileSystem(
    sourcePath,
    destinationPath
  );
  const newFileSystemTree = GetFilesInfoTree(newDestinationPath, extensions);
  await addTreeToTable(table, newFileSystemTree);
};

export const moveFileOrDirectoryInFileSystem = (
  sourcePath: string,
  destinationPath: string
): string => {
  try {
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Source path does not exist.");
    }

    if (
      fs.existsSync(destinationPath) &&
      fs.lstatSync(destinationPath).isFile()
    ) {
      destinationPath = path.dirname(destinationPath);
    }

    fs.mkdirSync(destinationPath, { recursive: true });

    const newPath = path.join(destinationPath, path.basename(sourcePath));

    fs.renameSync(sourcePath, newPath);

    console.log(`Moved ${sourcePath} to ${newPath}`);
    return newPath;
  } catch (error) {
    console.error("Error moving file or directory:", error);
    return "";
  }
};
