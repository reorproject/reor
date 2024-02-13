import * as path from "path";
import * as fs from "fs";
import { FileInfo, FileInfoTree, isFileNodeDirectory } from "./Types";
import chokidar from "chokidar";
import { WebContents } from "electron";
import * as fsPromises from "fs/promises";
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
      if (
        fileHasExtensionInList(pathInput, markdownExtensions) &&
        !isHidden(path.basename(pathInput))
      ) {
        fileInfoTree.push({
          name: path.basename(pathInput),
          path: pathInput,
          relativePath: parentRelativePath,
          dateModified: stats.mtime,
        });
      }
    } else {
      const itemsInDir = fs
        .readdirSync(pathInput)
        .filter((item) => !isHidden(item));

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
      if (!isHidden(path.basename(pathInput))) {
        fileInfoTree.push({
          name: path.basename(pathInput),
          path: pathInput,
          relativePath: parentRelativePath,
          dateModified: stats.mtime,
          children: childNodes,
        });
      }
    }
  } catch (error) {
    console.error(`Error accessing ${pathInput}:`, error);
  }

  return fileInfoTree;
}

function isHidden(fileName: string): boolean {
  return fileName.startsWith(".");
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
  senderWebContents: WebContents,
  directoryToWatch: string
): void {
  try {
    const watcher = chokidar.watch(directoryToWatch, {
      ignoreInitial: true,
    });

    const handleFileEvent = (eventType: string, filePath: string) => {
      if (
        fileHasExtensionInList(filePath, markdownExtensions) ||
        eventType.includes("directory")
      ) {
        // TODO: add logic to update vector db
        updateFileListForRenderer(senderWebContents, directoryToWatch);
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
  senderWebContents: WebContents,
  directory: string
): void {
  const files = GetFilesInfoTree(directory);
  senderWebContents.send("files-list", files);
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
  moveFileOrDirectoryInFileSystem(sourcePath, destinationPath).then(
    (newDestinationPath) => {
      if (newDestinationPath) {
        addTreeToTable(table, GetFilesInfoTree(newDestinationPath));
      }
    }
  );

  // const newFileSystemTree = GetFilesInfoTree(newDestinationPath);
  // await addTreeToTable(table, newFileSystemTree);
};

export const moveFileOrDirectoryInFileSystem = async (
  sourcePath: string,
  destinationPath: string
): Promise<string> => {
  try {
    // Check if source path exists
    try {
      await fsPromises.access(sourcePath);
    } catch (error) {
      throw new Error("Source path does not exist.");
    }

    // Check if destination path is a file
    let destinationStats;
    try {
      destinationStats = await fsPromises.lstat(destinationPath);
    } catch (error) {
      // Error means destination path does not exist, which is fine
    }

    if (destinationStats && destinationStats.isFile()) {
      destinationPath = path.dirname(destinationPath);
    }

    // Create destination directory
    await fsPromises.mkdir(destinationPath, { recursive: true });

    // Move the file or directory
    const newPath = path.join(destinationPath, path.basename(sourcePath));
    await fsPromises.rename(sourcePath, newPath);

    console.log(`Moved ${sourcePath} to ${newPath}`);
    return newPath;
  } catch (error) {
    console.error("Error moving file or directory:", error);
    return "";
  }
};
