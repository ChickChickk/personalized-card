// End-to-end test of the full card pipeline:
//   fill form → AI-generate the message → create card → play the mini-game → letter reveals.
//
// Runs against the URL in playwright.config.js (production by default).
// Test cards are tagged with TAG below so they're easy to spot/delete in
// Supabase:  DELETE FROM cards WHERE data->>'to' = 'E2E-TEST';

const { test, expect } = require("@playwright/test");

const TAG = "E2E-TEST";
const PROMPT = "a warm birthday note for my best friend";

// Data-driven list of games to exercise. We start with balloons; to cover
// every game later, add entries here and give each a `play` strategy.
// (Canvas games with random/animated targets are popped by sweeping clicks;
// twitchy games like snake/simon will likely need their own strategy.)
const GAMES = [
  { id: "balloons", title: "Balloons Burst", play: playByClickingCanvas },
];

for (const game of GAMES) {
  test(`create card → play ${game.id} → share link works for recipient`, async ({
    page,
    context,
    browser,
  }) => {
    // Allow reading the clipboard so we can grab what the copy button copies.
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    // 1. Open the builder.
    await page.goto("/");
    await expect(page.locator("#builder-view")).toBeVisible();

    // 2. Fill the names (tagged so the card is identifiable in the DB).
    await page.fill("#input-to", TAG);
    await page.fill("#input-from", TAG);

    // 3. Let the AI write the message instead of typing one. Verify the real
    //    /api/draft (Groq) call succeeds — not just the local template
    //    fallback the UI uses when the API errors.
    await page.fill("#helper-prompt", PROMPT);
    const draftResponse = page.waitForResponse(
      (res) => res.url().includes("/api/draft") && res.request().method() === "POST"
    );
    await page.click("#btn-magic-draft");
    const response = await draftResponse;
    expect(response.status()).toBe(200);
    expect((await response.json()).message.trim().length).toBeGreaterThan(0);

    // Capture exactly what the AI produced so we can confirm it survives the
    // whole round-trip to the revealed letter.
    await expect(page.locator("#input-message")).not.toHaveValue("");
    const aiMessage = await page.locator("#input-message").inputValue();

    // 4. Pick the game.
    await page.click(`.game-mode-card[data-game-id="${game.id}"]`);

    // 5. Create the card → goes straight to the gameplay view in-place.
    await page.click("#btn-create-card");
    await expect(page.locator("#gameplay-view")).toBeVisible();
    await expect(page.locator("#game-engine-stage canvas")).toBeVisible();

    // 6. Play until the game completes.
    await game.play(page);

    // 7. The letter is revealed with the AI-generated message intact.
    await expect(page.locator("#letter-view")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#final-to")).toHaveText(TAG);
    await expect(page.locator("#final-from")).toHaveText(TAG);
    await expect(page.locator("#final-message")).toHaveText(aiMessage);

    // 8. Copy the share link via the button, then read it from the clipboard.
    await page.click("#btn-copy-link");
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(shareUrl).toContain("?c=");
    expect(shareUrl).not.toContain("preview=1"); // a real recipient link

    // 9. Open that link as a brand-new visitor (fresh, isolated context — no
    //    shared cookies/storage, like a different person on another device).
    const recipientContext = await browser.newContext();
    const recipientPage = await recipientContext.newPage();
    await recipientPage.goto(shareUrl);

    // The recipient must play the game to unlock the message.
    await expect(recipientPage.locator("#gameplay-view")).toBeVisible();
    await expect(recipientPage.locator("#game-engine-stage canvas")).toBeVisible();
    await game.play(recipientPage);

    // 10. The same card — same AI message — is revealed to the recipient.
    await expect(recipientPage.locator("#letter-view")).toBeVisible({ timeout: 15_000 });
    await expect(recipientPage.locator("#final-to")).toHaveText(TAG);
    await expect(recipientPage.locator("#final-message")).toHaveText(aiMessage);

    await recipientContext.close();
  });
}

// Canvas balloons are drawn (not DOM elements) at random, animated positions,
// so we can't target one balloon. Instead we sweep clicks across the canvas
// repeatedly until the win condition flips the view to the letter.
async function playByClickingCanvas(page) {
  const canvas = page.locator("#game-engine-stage canvas");
  const box = await canvas.boundingBox();
  if (!box) throw new Error("game canvas not found");

  const cols = 6;
  const rows = 6;
  const letter = page.locator("#letter-view");

  for (let pass = 0; pass < 60; pass++) {
    if (await letter.isVisible()) return;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = box.x + ((c + 0.5) / cols) * box.width;
        const y = box.y + ((r + 0.5) / rows) * box.height;
        await page.mouse.click(x, y, { delay: 5 });
      }
    }
    if (await letter.isVisible()) return;
    await page.waitForTimeout(150); // let new balloons spawn/float
  }
}
