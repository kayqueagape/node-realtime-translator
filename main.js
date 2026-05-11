import "dotenv/config";
import electron from "electron";
const { app, globalShortcut } = electron;
import { startApp } from "./src/app.js";
import { stopTranscription, togglePause } from "./src/services/assemblyai.js";
import { updatePauseState, sendHotkeyHints } from "./src/services/overlay.js";

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const stopKey  = process.env.HOTKEY_STOP  || "Ctrl+Shift+Q";
  const pauseKey = process.env.HOTKEY_PAUSE || "Ctrl+Shift+P";

  globalShortcut.register(stopKey, async () => {
    console.log("\nStopping...");
    await stopTranscription();
    app.quit();
  });

  globalShortcut.register(pauseKey, () => {
    const paused = togglePause();
    console.log(paused ? "\nPaused." : "\nResumed.");
    updatePauseState(paused);
  });

  await startApp();

  sendHotkeyHints(stopKey, pauseKey);
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
