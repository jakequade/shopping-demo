import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
  webServer: [
    {
      command: "cd ../api && npx tsx src/app.ts",
      port: 3001,
      reuseExistingServer: false,
      timeout: 15_000,
    },
    {
      command: "npx next dev --port 3000",
      port: 3000,
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});