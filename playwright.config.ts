import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const factoryChromium = [
  "/opt/pw-browsers/chromium-1234/chrome-linux64/chrome",
  "/opt/pw-browsers/chromium-1208/chrome-linux64/chrome"
].find(existsSync);

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 390, height: 844 },
    browserName: "chromium",
    launchOptions: factoryChromium ? { executablePath: factoryChromium } : undefined
  },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false
  }
});
