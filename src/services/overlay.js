
import electron from "electron";
const { BrowserWindow, ipcMain, screen } = electron;

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let win = null;

export function createOverlay() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width: 900,
    height: 80,
    x: Math.floor((width - 900) / 2),
    y: height - 120,
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "..", "components", "overlay.html"));

  win.setAlwaysOnTop(true, "screen-saver");

  win.webContents.once("did-finish-load", () => {
    console.log("Overlay created!");
  });

  ipcMain.on("overlay-drag", (_, { x, y }) => {
    if (win && !win.isDestroyed()) win.setPosition(x, y);
  });
}

export function updateCaption(text) {
  if (win && !win.isDestroyed()) {
    win.webContents.send("caption", text);
  }
}