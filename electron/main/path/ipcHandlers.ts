import path from 'path';

import { ipcMain } from 'electron';

import { markdownExtensions } from '../filesystem/filesystem';

import { addExtensionToFilenameIfNoExtensionPresent } from './path';

export const pathHandlers = () => {
  ipcMain.handle('path-basename', (event, pathString: string) =>
    path.basename(pathString),
  );

  ipcMain.handle('path-sep', () => path.sep);

  ipcMain.handle('join-path', (event, ...args) => path.join(...args));

  ipcMain.handle(
    'path-dirname',
    (event, pathString: string) => path.dirname(pathString) + path.sep,
  );

  ipcMain.handle('path-relative', (event, from: string, to: string) =>
    path.relative(from, to),
  );

  ipcMain.handle(
    'add-extension-if-no-extension-present',
    (event, pathString: string) =>
      addExtensionToFilenameIfNoExtensionPresent(
        pathString,
        markdownExtensions,
        '.md',
      ),
  );
};
