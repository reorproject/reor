import { BrowserWindow, WebContents, screen } from "electron";
import { LanceDBTableWrapper } from "./database/LanceTableWrapper";
import Store from "electron-store";
import { StoreKeys, StoreSchema } from "./Store/storeConfig";

type WindowInfo = {
  windowID: number;
  dbTableClient: LanceDBTableWrapper;
  vaultDirectoryForWindow: string;
};

class WindowsManager {
  activeWindows: WindowInfo[] = [];

  getAndSetupDirectoryFromPreviousSessionIfUnused(
    webContents: Electron.WebContents,
    store: Store<StoreSchema>
  ): string {
    const lastUsedVaultDirectory = store.get(
      StoreKeys.DirectoryFromPreviousSession
    ) as string;
    if (!lastUsedVaultDirectory) {
      return "";
    }
    const isUserDirectoryUsed = this.activeWindows.some(
      (w) => w.vaultDirectoryForWindow === lastUsedVaultDirectory
    );
    if (!isUserDirectoryUsed) {
      this.setVaultDirectoryForContents(
        webContents,
        lastUsedVaultDirectory,
        store
      );
      return lastUsedVaultDirectory;
    }
    return "";
  }

  getBrowserWindowId(webContents: WebContents): number | null {
    const browserWindow = BrowserWindow.fromWebContents(webContents);
    return browserWindow ? browserWindow.id : null;
  }

  getWindowInfoForContents(webContents: WebContents): WindowInfo | null {
    const windowID = this.getBrowserWindowId(webContents);
    if (windowID === null) {
      return null;
    }

    const windowInfo = this.activeWindows.find((w) => w.windowID === windowID);
    return windowInfo || null;
  }

  getVaultDirectoryForWinContents(webContents: WebContents): string | null {
    const windowID = this.getBrowserWindowId(webContents);
    return windowID ? this.getVaultDirectoryForWindowID(windowID) : null;
  }

  private getVaultDirectoryForWindowID(windowID: number): string | null {
    const windowInfo = this.activeWindows.find((w) => w.windowID === windowID);
    return windowInfo ? windowInfo.vaultDirectoryForWindow : null;
  }

  setVaultDirectoryForContents(
    webContents: WebContents,
    directory: string,
    store: Store<StoreSchema>
  ): void {
    if (!webContents) {
      throw new Error("Invalid webContents provided.");
    }

    const windowID = this.getBrowserWindowId(webContents);
    if (!windowID) {
      throw new Error("Unable to find the browser window ID.");
    }

    if (!directory || typeof directory !== "string") {
      throw new Error("Invalid directory provided.");
    }

    let windowInfo = this.activeWindows.find((w) => w.windowID === windowID);

    if (!windowInfo) {
      windowInfo = {
        windowID: windowID,
        dbTableClient: new LanceDBTableWrapper(), // Assuming default value as null, modify as needed
        vaultDirectoryForWindow: directory,
      };
      this.activeWindows.push(windowInfo);
    } else {
      windowInfo.vaultDirectoryForWindow = directory;
    }

    store.set(StoreKeys.DirectoryFromPreviousSession, directory);
  }

  prepareWindowForClose(store: Store<StoreSchema>, win: BrowserWindow) {
    const directoryToSave = this.getVaultDirectoryForWinContents(
      win.webContents
    );

    // Save the directory if found
    if (directoryToSave) {
      store.set(StoreKeys.DirectoryFromPreviousSession, directoryToSave);
      this.removeActiveWindowByDirectory(directoryToSave);
    }
  }

  removeActiveWindowByDirectory(directory: string): void {
    this.activeWindows = this.activeWindows.filter(
      (w) => w.vaultDirectoryForWindow !== directory
    );
  }

  getNextWindowPosition(): { x: number | undefined; y: number | undefined } {
    const windowOffset = 30; // Offset for each new window
    const focusedWin = BrowserWindow.getFocusedWindow();

    if (focusedWin) {
      const [x, y] = focusedWin.getPosition();
      return { x: x + windowOffset, y: y + windowOffset };
    } else {
      return { x: undefined, y: undefined };
    }
  }

  getWindowSize(): { width: number; height: number } {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    const windowWidth = Math.min(1200, width * 0.8); // e.g., 80% of screen width or 1200px
    const windowHeight = Math.min(800, height * 0.8); // e.g., 80% of screen height or 800px

    return { width: windowWidth, height: windowHeight };
  }
}

export default WindowsManager;
