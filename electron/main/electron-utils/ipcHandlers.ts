import * as fs from "fs/promises";

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

import WindowsManager from "../common/windowManager";
import { handleAddNewNoteResponse } from "../common/newFiles";
import { StoreKeys, StoreSchema } from "../electron-store/storeConfig";

export const electronUtilsHandlers = (
  store: Store<StoreSchema>,
  windowsManager: WindowsManager,
  preload: string,
  url: string | undefined,
  indexHtml: string
) => {
  ipcMain.handle("show-context-menu-item", (event) => {
    const menu = new Menu();

    menu.append(
      new MenuItem({
        label: "New Note",
        click: () => {
          event.sender.send("add-new-note-response");
        },
      })
    );

    menu.append(
      new MenuItem({
        label: "New Directory",
        click: () => {
          event.sender.send("add-new-directory-response");
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
            event.sender.send("add-new-note-response", file.relativePath);
          },
        })
      );

      menu.append(
        new MenuItem({
          label: "New Directory",
          click: () => {
            event.sender.send("add-new-directory-response", file.path);
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

  // Used on EmptyPage.tsx to create a new file
  ipcMain.handle("empty-new-note-listener", (event, relativePath) => {
    event.sender.send("add-new-note-response", relativePath);
  });

  // Used on EmptyPage.tsx to create a new directory
  ipcMain.handle("empty-new-directory-listener", (event, relativePath) => {
    event.sender.send("add-new-directory-response", relativePath);
  });
};
