import { BrowserWindow, WebContents } from "electron";
import { LanceDBTableWrapper } from "./database/LanceTableWrapper";

type WindowInfo = {
  windowID: number;
  dbTableClient: LanceDBTableWrapper;
  vaultDirectoryForWindow: string;
};

export const windows: WindowInfo[] = [];

// then as boot logic, we could just go through and create each of these

export function getBrowserWindowId(webContents: WebContents): number | null {
  const browserWindow = BrowserWindow.fromWebContents(webContents);
  return browserWindow ? browserWindow.id : null;
}

export function getWindowInfoForContents(
  windows: WindowInfo[],
  webContents: WebContents
): WindowInfo | null {
  const windowID = getBrowserWindowId(webContents);
  if (windowID === null) {
    return null;
  }

  const windowInfo = windows.find((w) => w.windowID === windowID);
  return windowInfo || null;
}

export function getVaultDirectoryForContents(
  windows: WindowInfo[],
  webContents: WebContents
): string | null {
  const windowID = getBrowserWindowId(webContents);
  return windowID ? getVaultDirectoryForWindowID(windows, windowID) : null;
}

function getVaultDirectoryForWindowID(
  windows: WindowInfo[],
  windowID: number
): string | null {
  const windowInfo = windows.find((w) => w.windowID === windowID);
  return windowInfo ? windowInfo.vaultDirectoryForWindow : null;
}

export function setVaultDirectoryForContents(
  windows: WindowInfo[],
  webContents: WebContents,
  directory: string
): void {
  if (!webContents) {
    throw new Error("Invalid webContents provided.");
  }

  const windowID = getBrowserWindowId(webContents);
  if (!windowID) {
    throw new Error("Unable to find the browser window ID.");
  }

  if (!directory || typeof directory !== "string") {
    throw new Error("Invalid directory provided.");
  }

  let windowInfo = windows.find((w) => w.windowID === windowID);

  // If the windowID is not found, create a new WindowInfo object and add it to the windows array
  if (!windowInfo) {
    windowInfo = {
      windowID: windowID,
      dbTableClient: new LanceDBTableWrapper(), // Assuming default value as null, modify as needed
      vaultDirectoryForWindow: directory,
    };
    windows.push(windowInfo);
  } else {
    // If found, just update the directory
    windowInfo.vaultDirectoryForWindow = directory;
  }
}
