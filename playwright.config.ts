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
    browserName: "chromium",
    launchOptions: factoryChromium ? { executablePath: factoryChromium } : undefined
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false
  }
});
