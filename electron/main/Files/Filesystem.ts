import path from "path";
import fs from "fs";
import { FileInfo } from "./Types";
import chokidar from "chokidar";
import { BrowserWindow } from "electron";

export function GetFilesInfo(
  directory: string,
  extensions?: string[],
  parentRelativePath: string = ""
): FileInfo[] {
  let fileList: FileInfo[] = [];

  if (!fs.existsSync(directory)) {
    console.error("Directory path does not exist:", directory);
    return fileList;
  }

  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const relativePath = path.join(parentRelativePath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const children = GetFilesInfo(itemPath, extensions, relativePath);
      fileList.push({
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
        fileList.push({
          name: item,
          path: itemPath,
          relativePath: relativePath,
          dateModified: stats.mtime,
          type: "file",
        });
      }
    }
  });
  console.log("returning this filelist: ", fileList);
  return fileList;
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
  const files = GetFilesInfo(directory, fileExtensions);
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
