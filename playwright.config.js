// @ts-check
const { defineConfig, devices } = require("@playwright/test");

// Where the tests run. Defaults to production; override with E2E_BASE_URL
// (e.g. E2E_BASE_URL=http://localhost:3000 npm run e2e) to point at a local
// `vercel dev` server later.
const baseURL =
  process.env.E2E_BASE_URL || "https://personalized-card-steel.vercel.app";

module.exports = defineConfig({
  testDir: "./e2e",
  // Generous per-test budget: the default slowMo below paces every click, so
  // the full pipeline (draft → create → play → reveal, twice per game) needs
  // more headroom than a full-speed run.
  timeout: 120_000,
  fullyParallel: false,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    // Record a video of every run — this doubles as the demo clip.
    video: "on",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    // Slow each Playwright action by E2E_SLOWMO ms so clicks are easy to
    // follow in the recorded video. Defaults to 150ms every run (CI included);
    // set E2E_SLOWMO=0 for a fast run, or `npm run e2e:demo` for an even
    // slower, headed walkthrough.
    launchOptions: {
      slowMo:
        process.env.E2E_SLOWMO !== undefined
          ? Number(process.env.E2E_SLOWMO)
          : 150,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
