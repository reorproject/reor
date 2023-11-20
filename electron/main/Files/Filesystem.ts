import path from "path";
import fs from "fs";
import { FileInfo } from "./Types";

export function GetFilesInfo(
  directory: string,
  parentRelativePath: string = ""
): FileInfo[] {
  let fileList: FileInfo[] = [];

  const items = fs.readdirSync(directory);

  items.forEach((item) => {
    const itemPath = path.join(directory, item);
    const relativePath = path.join(parentRelativePath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      const children = GetFilesInfo(itemPath, relativePath);
      fileList.push({
        name: item,
        path: itemPath,
        relativePath: relativePath,
        dateModified: stats.mtime,
        type: "directory",
        children: children,
      });
    } else {
      fileList.push({
        name: item,
        path: itemPath,
        relativePath: relativePath,
        dateModified: stats.mtime,
        type: "file",
      });
    }
  });

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
