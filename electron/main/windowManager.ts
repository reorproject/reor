import { BrowserWindow, WebContents } from "electron";
import { LanceDBTableWrapper } from "./database/LanceTableWrapper";
import Store from "electron-store";
import { StoreKeys, StoreSchema } from "./Store/storeConfig";
import { screen } from "electron";
type WindowInfo = {
  windowID: number;
  dbTableClient: LanceDBTableWrapper;
  vaultDirectoryForWindow: string;
};

export const activeWindows: WindowInfo[] = [];

export function setupDirectoryFromPreviousSessionIfUnused(
  windows: WindowInfo[],
  webContents: Electron.WebContents,
  store: Store<StoreSchema>
): string {
  // If the user directory is not set, set it to the default directory
  const lastUsedVaultDirectory = store.get(
    StoreKeys.DirectoryFromPreviousSession
  ) as string;
  if (!lastUsedVaultDirectory) {
    return "";
  }
  // check if any of the windows are using the user directory
  const isUserDirectoryUsed = windows.some(
    (w) => w.vaultDirectoryForWindow === lastUsedVaultDirectory
  );
  if (!isUserDirectoryUsed) {
    // so here we need to set the windows
    setVaultDirectoryForContents(windows, webContents, lastUsedVaultDirectory);
    return lastUsedVaultDirectory;
  }
  return "";
}

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

export function getNextWindowPosition() {
  const windowOffset = 30; // Offset for each new window
  let newX, newY;

  // Find the currently focused window
  const focusedWin = BrowserWindow.getFocusedWindow();

  if (focusedWin) {
    const [x, y] = focusedWin.getPosition();
    newX = x + windowOffset;
    newY = y + windowOffset;
  } else {
    // If no window is focused, set a default position (center or specific coordinate)
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    newX = (width - 1200) / 2;
    newY = (height - 800) / 2;
  }

  return { x: newX, y: newY };
}

export function getWindowSize() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Calculate size as a percentage of screen size
  const windowWidth = Math.min(1200, width * 0.8); // e.g., 80% of screen width or 1200px
  const windowHeight = Math.min(800, height * 0.8); // e.g., 80% of screen height or 800px

  return { width: windowWidth, height: windowHeight };
}
