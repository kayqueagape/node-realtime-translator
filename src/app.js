
import "dotenv/config";
import electron from "electron";
const { BrowserWindow, ipcMain } = electron;
import path from "path";
import { fileURLToPath } from "url";
import { startTranscription } from "./services/assemblyai.js";
import { createOverlay } from "./services/overlay.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function startApp() {
  const targetLanguage = await showLanguageSelector();
  createOverlay();
  await startTranscription(targetLanguage);
}

function showLanguageSelector() {
  return new Promise((resolve) => {
    const win = new BrowserWindow({
      width: 420,
      height: 520,
      resizable: false,
      title: "Choose target language",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    const selectorHtmlPath = path.join(__dirname, "components", "selector.html");
    console.log("Loading language selector from:", selectorHtmlPath);

    win.loadFile(selectorHtmlPath).catch((err) => {
      console.error("Error loading selector HTML:", err);
    });

    ipcMain.once("target-language-selected", (_, language) => {
      win.close();
      resolve(language);
    });
  });
}