import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/presentation",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3000",
    headless: true,
  },
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ANTHROPIC_API_KEY: "test-placeholder",
      GOOGLE_CLIENT_ID: "test-placeholder",
      GOOGLE_CLIENT_SECRET: "test-placeholder",
      GOOGLE_REDIRECT_URI: "http://127.0.0.1:3000/api/auth/google/callback",
    },
  },
});
