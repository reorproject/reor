import * as fs from "fs/promises";
import { release } from "node:os";
import { join } from "node:path";
import * as path from "path";

import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  MenuItem,
  shell,
} from "electron";
import Store from "electron-store";

import { errorToStringMainProcess } from "./common/error";
import { addExtensionToFilenameIfNoExtensionPresent } from "./common/path";
import WindowsManager from "./common/windowManager";
import { StoreKeys, StoreSchema } from "./electron-store/storeConfig";
import { registerStoreHandlers } from "./electron-store/storeHandlers";
import { markdownExtensions } from "./filesystem/filesystem";
import { registerFileHandlers } from "./filesystem/registerFilesHandler";
import {
  ollamaService,
  registerLLMSessionHandlers,
} from "./llm/llmSessionHandlers";
import { registerDBSessionHandlers } from "./vector-database/dbSessionHandlers";

const store = new Store<StoreSchema>();
// store.clear(); // clear store for testing CAUTION: THIS WILL DELETE YOUR CHAT HISTORY
const windowsManager = new WindowsManager();

process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
console.log("process.env.DIST", process.env.DIST);
const indexHtml = join(process.env.DIST, "index.html");

app.whenReady().then(async () => {
  try {
    await ollamaService.init();
  } catch (error) {
    windowsManager.appendNewErrorToDisplayInWindow(
      errorToStringMainProcess(error)
    );
  }
  windowsManager.createWindow(store, preload, url, indexHtml);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", async () => {
  ollamaService.stop();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    windowsManager.createWindow(store, preload, url, indexHtml);
  }
});

registerLLMSessionHandlers(store);
registerDBSessionHandlers(store, windowsManager);
registerStoreHandlers(store, windowsManager);
registerFileHandlers(store, windowsManager);

ipcMain.handle("open-directory-dialog", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
  });
  if (!result.canceled) {
    return result.filePaths;
  } else {
    return null;
  }
});

ipcMain.handle("open-file-dialog", async (event, extensions) => {
  const filters =
    extensions && extensions.length > 0 ? [{ name: "Files", extensions }] : [];

  const result = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections", "showHiddenFiles"], // Add 'showHiddenFiles' here
    filters: filters,
  });

  if (!result.canceled) {
    return result.filePaths;
  } else {
    return [];
  }
});

ipcMain.handle("show-context-menu-item", (event) => {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: "New Note",
      click: () => {
        event.sender.send("add-new-note-listener");
      },
    })
  );

  menu.append(
    new MenuItem({
      label: "New Directory",
      click: () => {
        event.sender.send("add-new-directory-listener");
      },
    })
  );

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) menu.popup({ window: browserWindow });
});

ipcMain.handle("show-context-menu-file-item", async (event, file) => {
  const menu = new Menu();

  const stats = await fs.stat(file.path);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    menu.append(
      new MenuItem({
        label: "New Note",
        click: () => {
          event.sender.send("add-new-note-listener", file.relativePath);
        },
      })
    );

    menu.append(
      new MenuItem({
        label: "New Directory",
        click: () => {
          event.sender.send("add-new-directory-listener", file.path);
        },
      })
    );
  }

  menu.append(
    new MenuItem({
      label: "Delete",
      click: () => {
        return dialog
          .showMessageBox({
            type: "question",
            title: "Delete File",
            message: `Are you sure you want to delete "${file.name}"?`,
            buttons: ["Yes", "No"],
          })
          .then((confirm) => {
            if (confirm.response === 0) {
              console.log(file.path);
              event.sender.send("delete-file-listener", file.path);
            }
          });
      },
    })
  );
  menu.append(
    new MenuItem({
      label: "Rename",
      click: () => {
        console.log(file.path);
        event.sender.send("rename-file-listener", file.path);
      },
    })
  );

  menu.append(
    new MenuItem({
      label: "Create a flashcard set",
      click: () => {
        console.log("creating: ", file.path);
        event.sender.send("create-flashcard-file-listener", file.path);
      },
    })
  );

  menu.append(
    new MenuItem({
      label: "Add file to chat context",
      click: () => {
        console.log("creating: ", file.path);
        event.sender.send("add-file-to-chat-listener", file.path);
      },
    })
  );

  console.log("menu key: ", file);

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) {
    menu.popup({ window: browserWindow });
  }
});

ipcMain.handle("show-chat-menu-item", (event, chatID) => {
  const menu = new Menu();

  menu.append(
    new MenuItem({
      label: "Delete Chat",
      click: () => {
        const vaultDir = windowsManager.getVaultDirectoryForWinContents(
          event.sender
        );

        if (!vaultDir) {
          return;
        }

        const chatHistoriesMap = store.get(StoreKeys.ChatHistories);
        const allChatHistories = chatHistoriesMap[vaultDir] || [];
        const filteredChatHistories = allChatHistories.filter(
          (item) => item.id !== chatID
        );
        chatHistoriesMap[vaultDir] = filteredChatHistories;
        store.set(StoreKeys.ChatHistories, chatHistoriesMap);
        event.sender.send(
          "update-chat-histories",
          chatHistoriesMap[vaultDir] || []
        );
      },
    })
  );

  const browserWindow = BrowserWindow.fromWebContents(event.sender);
  if (browserWindow) menu.popup({ window: browserWindow });
});

ipcMain.handle("open-external", (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle("get-platform", async () => {
  return process.platform;
});

ipcMain.handle("open-new-window", () => {
  windowsManager.createWindow(store, preload, url, indexHtml);
});

ipcMain.handle("get-reor-app-version", async () => {
  return app.getVersion();
});

ipcMain.handle("path-basename", (event, pathString: string) => {
  return path.basename(pathString);
});

ipcMain.handle("path-sep", () => {
  return path.sep;
});

ipcMain.handle("join-path", (event, ...args) => {
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
