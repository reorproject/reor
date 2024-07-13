import path from "path";

import { ipcMain } from "electron";

import { markdownExtensions } from "../filesystem/filesystem";

import { addExtensionToFilenameIfNoExtensionPresent } from "./path";

export const pathHandlers = () => {
  ipcMain.handle("path-basename", (event, pathString: string) => {
    return path.basename(pathString);
  });

  ipcMain.handle("path-sep", () => {
    return path.sep;
  });

  ipcMain.handle("join-path", (event, ...args: string[]) => {
    return path.join(...args);
  });

  ipcMain.handle("path-dirname", (event, pathString: string) => {
    return path.dirname(pathString) + path.sep;
  });

  ipcMain.handle("path-relative", (event, from: string, to: string) => {
    return path.relative(from, to);
  });

  ipcMain.handle(
    "add-extension-if-no-extension-present",
    (event, pathString: string) => {
      return addExtensionToFilenameIfNoExtensionPresent(
        pathString,
        markdownExtensions,
        ".md"
      );
    }
  );
};
