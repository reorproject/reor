import path from "path";
import fs from "fs";
import { FileInfo, FileInfoTree, isFileNodeDirectory } from "./Types";
import chokidar from "chokidar";
import { BrowserWindow } from "electron";
import {
  addTreeToTable,
  removeTreeFromTable,
} from "../database/TableHelperFunctions";
import { LanceDBTableWrapper } from "../database/LanceTableWrapper";

export const markdownExtensions = [
  ".md",
  ".markdown",
  ".mdown",
  ".mkdn",
  ".mkd",
];

export function GetFilesInfoList(directory: string): FileInfo[] {
  const fileInfoTree = GetFilesInfoTree(directory);
  const fileInfoList = flattenFileInfoTree(fileInfoTree);
  return fileInfoList;
}

export function GetFilesInfoTree(
  pathInput: string,
  parentRelativePath: string = ""
): FileInfoTree {
  const fileInfoTree: FileInfoTree = [];

  if (!fs.existsSync(pathInput)) {
    console.error("Path does not exist:", pathInput);
    return fileInfoTree;
  }

  try {
    const stats = fs.statSync(pathInput);
    if (stats.isFile()) {
      if (fileHasExtensionInList(pathInput, markdownExtensions)) {
        fileInfoTree.push({
          name: path.basename(pathInput),
          path: pathInput,
          relativePath: parentRelativePath,
          dateModified: stats.mtime,
        });
      }
    } else {
      const itemsInDir = fs.readdirSync(pathInput);

      const childNodes: FileInfoTree = itemsInDir
        .map((item) => {
          const itemPath = path.join(pathInput, item);
          return GetFilesInfoTree(
            itemPath,
            path.join(parentRelativePath, item)
          );
        })
        .flat();
      if (parentRelativePath === "") {
        return childNodes;
      }
      fileInfoTree.push({
        name: path.basename(pathInput),
        path: pathInput,
        relativePath: parentRelativePath,
        dateModified: stats.mtime,
        children: childNodes,
      });
    }
  } catch (error) {
    console.error(`Error accessing ${pathInput}:`, error);
  }

  return fileInfoTree;
}

export function flattenFileInfoTree(tree: FileInfoTree): FileInfo[] {
  let flatList: FileInfo[] = [];

  for (const node of tree) {
    if (!isFileNodeDirectory(node)) {
      flatList.push({
        name: node.name,
        path: node.path,
        relativePath: node.relativePath,
        dateModified: node.dateModified,
      });
    }

    if (isFileNodeDirectory(node) && node.children) {
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
  directory: string
): void {
  try {
    const watcher = chokidar.watch(directory, {
      ignoreInitial: true,
    });

    const handleFileEvent = (eventType: string, filePath: string) => {
      if (fileHasExtensionInList(filePath, markdownExtensions)) {
        updateFileListForRenderer(win, directory);
      }
    };

    watcher
      .on("add", (path) => handleFileEvent("added", path))
      .on("change", (path) => handleFileEvent("changed", path))
      .on("unlink", (path) => handleFileEvent("removed", path))
      .on("addDir", (path) => handleFileEvent("directory added", path))
      .on("unlinkDir", (path) => handleFileEvent("directory removed", path));

    // No 'ready' event handler is needed here, as we're ignoring initial scan
  } catch (error) {
    console.error("Error setting up file watcher:", error);
  }
}

function fileHasExtensionInList(
  filePath: string,
  extensions: string[]
): boolean {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    return extensions.includes(fileExtension);
  } catch (error) {
    console.error("Error checking file extension for extensions:", extensions);
    return false;
  }
}

export function appendExtensionIfMissing(
  filename: string,
  extensions: string[]
): string {
  // Check if the filename ends with any of the provided extensions
  const hasExtension = extensions.some((ext) => filename.endsWith(ext));

  // If the filename already has one of the extensions, return it as is
  if (hasExtension) {
    return filename;
  }

  // If not, append the first extension from the list to the filename
  return filename + extensions[0];
}

export function updateFileListForRenderer(
  win: BrowserWindow,
  directory: string
): void {
  const files = GetFilesInfoTree(directory);
  if (win) {
    win.webContents.send("files-list", files);
  }
}

export function readFile(filePath: string): string {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return data;
  } catch (err) {
    console.error("An error occurred:", err);
    return "";
  }
}

export const orchestrateEntryMove = async (
  table: LanceDBTableWrapper,
  sourcePath: string,
  destinationPath: string
) => {
  const fileSystemTree = GetFilesInfoTree(sourcePath);
  await removeTreeFromTable(table, fileSystemTree);
  const newDestinationPath = moveFileOrDirectoryInFileSystem(
    sourcePath,
    destinationPath
  );
  const newFileSystemTree = GetFilesInfoTree(newDestinationPath);
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
