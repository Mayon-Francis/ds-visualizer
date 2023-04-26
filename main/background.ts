import { app, ipcMain, dialog } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import DirectoryTree from "directory-tree";
const isProd: boolean = process.env.NODE_ENV === "production";

import { FSWatcher, watch } from "chokidar";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let folderWatcher: FSWatcher | undefined = undefined;
let folderPath: string | undefined = undefined;
let mainWindow: Electron.BrowserWindow;

function parseAndSendTree(path: string) {
  const tree = DirectoryTree(path, {
    attributes: ["size", "type", "extension"],
    normalizePath: true,
  });

  mainWindow.webContents.send("folder-change", tree);
}

(async () => {
  await app.whenReady();

  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    title: "Ds-Visualizer",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  ipcMain.on("open-folder", async () => {
    const folder = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
      buttonLabel: "Open",
      title: "Open a folder",
    });
    folderPath = folder.filePaths[0];
    await folderWatcher?.close();
    folderWatcher = watch(folderPath);

    parseAndSendTree(folderPath);

    folderWatcher.on("all", (event, path, stats) => {
      parseAndSendTree(folderPath);
    });
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home.html");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  folderWatcher?.close();
  app.quit();
});
