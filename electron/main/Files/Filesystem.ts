import path from "path";
import fs from "fs";
import { FileInfo, FileInfoNode, FileInfoTree } from "./Types";
import chokidar from "chokidar";
import { BrowserWindow } from "electron";

export function GetFilesInfoList(
  directory: string,
  extensions?: string[]
): FileInfo[] {
  const fileInfoTree = GetFilesInfoTree(directory, extensions);
  const fileInfoList = flattenFileInfoTree(fileInfoTree);
  return fileInfoList;
}

export function GetFilesInfoTree(
  directory: string,
  extensions?: string[],
  parentRelativePath: string = ""
): FileInfoTree {
  let fileInfoTree: FileInfoTree = [];

  if (!fs.existsSync(directory)) {
    console.error("Directory path does not exist:", directory);
    return fileInfoTree;
  }

  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const relativePath = path.join(parentRelativePath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const children = GetFilesInfoTree(itemPath, extensions, relativePath);
      fileInfoTree.push({
        name: item,
        path: itemPath,
        relativePath: relativePath,
        dateModified: stats.mtime,
        type: "directory",
        children: children,
      });
    } else {
      const fileExtension = path.extname(item).toLowerCase();

      if (
        (extensions && extensions.includes(fileExtension)) ||
        (!extensions && fileExtension)
      ) {
        if (item === ".DS_Store") {
          console.log("DS STORE IN ERE");
          console.log("extension is: ", fileExtension);
        }
        fileInfoTree.push({
          name: item,
          path: itemPath,
          relativePath: relativePath,
          dateModified: stats.mtime,
          type: "file",
        });
      }
    }
  });
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

export const moveFileOrDirectory = async (
  sourcePath: string,
  destinationPath: string
) => {
  try {
    // Check if the source exists
    if (!fs.existsSync(sourcePath)) {
      throw new Error("Source path does not exist.");
    }

    // Check if the destination is a file and adjust it to be its parent directory
    if (
      fs.existsSync(destinationPath) &&
      fs.lstatSync(destinationPath).isFile()
    ) {
      destinationPath = path.dirname(destinationPath);
    }

    // Ensure the destination directory exists
    fs.mkdirSync(destinationPath, { recursive: true });

    // Determine the new path
    const newPath = path.join(destinationPath, path.basename(sourcePath));

    // Move the file or directory
    fs.renameSync(sourcePath, newPath);

    console.log(`Moved ${sourcePath} to ${newPath}`);
  } catch (error) {
    console.error("Error moving file or directory:", error);
  }
};
