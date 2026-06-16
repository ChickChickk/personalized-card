// @ts-check
const { defineConfig, devices } = require("@playwright/test");

// Where the tests run. Defaults to production; override with E2E_BASE_URL
// (e.g. E2E_BASE_URL=http://localhost:3000 npm run e2e) to point at a local
// `vercel dev` server later.
const baseURL =
  process.env.E2E_BASE_URL || "https://personalized-card-steel.vercel.app";

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // Record a video of every run — this doubles as the demo clip.
    video: "on",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    // Slow each action by E2E_SLOWMO ms so the demo video is easy to follow.
    // Defaults to 0 (full speed) for everyday/CI runs; `npm run e2e:demo`
    // sets it higher.
    launchOptions: {
      slowMo: Number(process.env.E2E_SLOWMO || 0),
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
