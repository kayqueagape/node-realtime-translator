import electron from "electron";
const { app } = electron;
import { startApp } from "./src/app.js";

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  startApp();
});

app.on("window-all-closed", () => {
  app.quit();
});
