// End-to-end test of the full card pipeline:
//   fill form → AI-generate the message → create card → success screen
//   (see the message / preview as recipient / copy link / create another) →
//   recipient opens link → plays game → letter reveals.
//
// Runs against the URL in playwright.config.js (production by default).
// Test cards are tagged with TAG below so they're easy to spot/delete in
// Supabase:  DELETE FROM cards WHERE data->>'to' = 'E2E-TEST';

const { test, expect } = require("@playwright/test");

const TAG = "E2E-TEST";
const PROMPT = "a warm birthday note for my best friend";

// Optional pacing for demo videos: set E2E_PAUSE (ms, e.g. 2500) to hold on
// each milestone so the run is easy to follow. Defaults to 0 (fast) for CI.
const STEP_PAUSE_MS = Number(process.env.E2E_PAUSE || 0);
async function beat(p) {
  if (STEP_PAUSE_MS) await p.waitForTimeout(STEP_PAUSE_MS);
}

// Data-driven list of every game. Each entry says which element marks the
// game as mounted (`stageReady`) and how to play it to a win (`play`). The
// play strategies use real input — clicks, key presses, basket drags — and
// rely on `#letter-view` appearing as the single source of truth for "won",
// so they double as genuine end-to-end coverage of each game's win path.
const GAMES = [
  { id: "balloons", title: "Balloons Burst", stageReady: "#game-engine-stage canvas", play: playBalloons },
  { id: "catcher",  title: "Star Catcher",   stageReady: "#game-engine-stage canvas", play: playCatcher },
  { id: "snake",    title: "Micro Snake",    stageReady: "#game-engine-stage canvas", play: playSnake },
  { id: "clicker",  title: "Cookie Clicker", stageReady: "#clk-cookie",               play: playClicker },
  { id: "puzzle",   title: "Memory Match",   stageReady: "#pGrd",                     play: playPuzzle },
  { id: "simon",    title: "Simon Says",     stageReady: "#sm0",                      play: playSimon },
];

for (const game of GAMES) {
  test(`create card → success-screen actions → ${game.id} share link works for recipient`, async ({
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
      (res) =>
        res.url().includes("/api/draft") && res.request().method() === "POST",
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

    // 5. Create the card → lands on the success screen (no forced gameplay).
    await page.click("#btn-create-card");
    await expect(page.locator("#success-view")).toBeVisible();
    await expect(page.locator("#success-to")).toHaveText(TAG);
    await expect(page.locator("#success-game")).toHaveText(game.title);
    await expect(page.locator("#share-link-input")).toHaveValue(/\?c=/);
    await beat(page);

    // 6. Copy the share link via the button, then read it from the clipboard.
    await page.click("#btn-copy-link");
    const shareUrl = await page.evaluate(() => navigator.clipboard.readText());
    expect(shareUrl).toContain("?c=");
    expect(shareUrl).not.toContain("preview=1"); // a real recipient link
    await beat(page);

    // 7. "Preview as recipient" plays the game all the way through to the
    //    letter (just like a recipient would), then "Back" returns to success.
    await page.click("#btn-preview-recipient");
    await expect(page.locator("#gameplay-view")).toBeVisible();
    await expect(page.locator(game.stageReady)).toBeVisible();
    await game.play(page);
    await expect(page.locator("#letter-view")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#final-message")).toHaveText(aiMessage);
    await beat(page);
    await page.click("#btn-letter-back");
    await expect(page.locator("#success-view")).toBeVisible();
    await beat(page);

    // 8. "See the message" reveals the letter without playing the game, and
    //    "Back" returns to the success screen.
    await page.click("#btn-see-message");
    await expect(page.locator("#letter-view")).toBeVisible();
    await expect(page.locator("#final-to")).toHaveText(TAG);
    await expect(page.locator("#final-message")).toHaveText(aiMessage);
    await beat(page);
    await page.click("#btn-letter-back");
    await expect(page.locator("#success-view")).toBeVisible();
    await beat(page);

    // 9. "Create another card" returns the sender to a fresh, empty builder —
    //    the journey ends back on the first page.
    await page.click("#btn-create-another");
    await expect(page.locator("#builder-view")).toBeVisible();
    await expect(page.locator("#input-to")).toHaveValue("");
    await expect(page.locator("#input-from")).toHaveValue("");
    await expect(page.locator("#input-message")).toHaveValue("");
    await beat(page);

    // 10. Finally, confirm the share link works for a real recipient — a fresh,
    //     isolated browser (a different person on another device). This runs in
    //     its own context, so it opens as a separate window with its own video.
    const recipientContext = await browser.newContext();
    const recipientPage = await recipientContext.newPage();
    await recipientPage.goto(shareUrl);
    await expect(recipientPage.locator("#gameplay-view")).toBeVisible();
    await expect(recipientPage.locator(game.stageReady)).toBeVisible();
    await game.play(recipientPage);
    await expect(recipientPage.locator("#letter-view")).toBeVisible({
      timeout: 15_000,
    });
    await expect(recipientPage.locator("#final-to")).toHaveText(TAG);
    await expect(recipientPage.locator("#final-message")).toHaveText(aiMessage);
    await beat(recipientPage);
    await recipientContext.close();
  });
}

// ---------------------------------------------------------------------------
// Per-game play strategies. Each drives its game to a win with real input and
// returns once `#letter-view` is showing (the reveal), or gives up after a
// generous budget so a stuck game fails loudly instead of hanging.
// ---------------------------------------------------------------------------

// Balloons are drawn on a canvas (not DOM elements) at random, animated
// positions, so we can't target one balloon. Sweep clicks across the canvas
// repeatedly until 5 pops flip the view to the letter.
async function playBalloons(page) {
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

// Cookie Clicker: the 🍪 is a DOM element that jumps to a random spot after
// each hit. Read its live position, click it, repeat until the 10th hit wins.
async function playClicker(page) {
  const cookie = page.locator("#clk-cookie");
  const letter = page.locator("#letter-view");

  for (let i = 0; i < 40; i++) {
    if (await letter.isVisible()) return;
    const box = await cookie.boundingBox();
    if (box) {
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }
    await page.waitForTimeout(150); // cookie repositions ~110ms after a hit
  }
}

// Memory Match: tiles are DOM elements that carry their answer in
// `data-symbol`, so we can read every symbol up front and click the pairs
// directly. Correct pairs match instantly (only mismatches lock the board for
// 750ms), so back-to-back clicks are safe.
async function playPuzzle(page) {
  const tiles = page.locator("#pGrd > div");
  await tiles.first().waitFor();

  const symbols = await tiles.evaluateAll((els) =>
    els.map((e) => e.dataset.symbol),
  );

  const indicesBySymbol = new Map();
  symbols.forEach((symbol, i) => {
    if (!indicesBySymbol.has(symbol)) indicesBySymbol.set(symbol, []);
    indicesBySymbol.get(symbol).push(i);
  });

  for (const [, [a, b]] of indicesBySymbol) {
    await tiles.nth(a).click();
    await tiles.nth(b).click();
    await page.waitForTimeout(60); // matched pair registers immediately
  }
}

// Star Catcher: stars fall on a canvas (closure state we can't read directly),
// so we read the canvas pixels instead. Each frame we find the lowest non-
// background pixel (the star nearest the basket) and slide the basket under it
// by dispatching a mousemove. Tracking the lowest star guarantees we're in
// position as each one lands.
async function playCatcher(page) {
  await page.evaluate(
    (timeoutMs) =>
      new Promise((resolve) => {
        const canvas = document.getElementById("cCvs");
        const letter = document.getElementById("letter-view");
        if (!canvas) return resolve();
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        const start = Date.now();

        const iv = setInterval(() => {
          if (letter && !letter.classList.contains("hidden")) {
            clearInterval(iv);
            return resolve();
          }
          if (Date.now() - start > timeoutMs) {
            clearInterval(iv);
            return resolve();
          }

          // Find the lowest star by its gold colour (⭐). Matching colour
          // rather than "any non-background pixel" lets us scan the full
          // height — including the catch zone — without the red basket
          // (#e76f51, low green) detecting itself, and without a dead zone
          // that would make the basket abandon a star just before it lands.
          const data = ctx.getImageData(0, 0, W, H).data;
          let starX = null;
          let starY = -1;
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4;
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const isStar = r > 200 && g > 160 && g < 236 && b < 170;
              if (isStar && y > starY) {
                starY = y;
                starX = x;
              }
            }
          }

          // No star visible? Hold position rather than darting away.
          if (starX == null) return;

          const rect = canvas.getBoundingClientRect();
          const clientX = rect.left + starX * (rect.width / W);
          const clientY = rect.top + rect.height / 2;
          canvas.dispatchEvent(
            new MouseEvent("mousemove", { clientX, clientY, bubbles: true }),
          );
        }, 40);
      }),
    25_000,
  );
}

// Micro Snake: food and the snake live in closure state, so we read the canvas
// pixels to locate the head (#e76f51) and food (#e9c46a) cells, then steer with
// arrow keys toward the food (shortest path, accounting for wall-wrapping).
// The game has no death state, so greedy navigation always wins.
async function playSnake(page) {
  await page.evaluate(
    (timeoutMs) =>
      new Promise((resolve) => {
        const canvas = document.getElementById("sCvs");
        const letter = document.getElementById("letter-view");
        if (!canvas) return resolve();
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        const CELL = 22;
        const COLS = Math.round(W / CELL);
        const ROWS = Math.round(H / CELL);
        const start = Date.now();

        const findCell = (match) => {
          const data = ctx.getImageData(0, 0, W, H).data;
          let sx = 0;
          let sy = 0;
          let n = 0;
          for (let y = 0; y < H; y++) {
            for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4;
              if (match(data[i], data[i + 1], data[i + 2])) {
                sx += x;
                sy += y;
                n++;
              }
            }
          }
          if (!n) return null;
          return {
            x: Math.floor(sx / n / CELL),
            y: Math.floor(sy / n / CELL),
          };
        };

        const wrapDelta = (a, b, n) => {
          let d = (b - a + n) % n;
          if (d > n / 2) d -= n;
          return d;
        };

        const iv = setInterval(() => {
          if (letter && !letter.classList.contains("hidden")) {
            clearInterval(iv);
            return resolve();
          }
          if (Date.now() - start > timeoutMs) {
            clearInterval(iv);
            return resolve();
          }

          const head = findCell(
            (r, g, b) =>
              Math.abs(r - 231) < 28 &&
              Math.abs(g - 111) < 28 &&
              Math.abs(b - 81) < 28,
          );
          const food = findCell(
            (r, g, b) =>
              Math.abs(r - 233) < 30 &&
              Math.abs(g - 196) < 30 &&
              Math.abs(b - 106) < 30,
          );
          if (!head || !food) return;

          const dx = wrapDelta(head.x, food.x, COLS);
          const dy = wrapDelta(head.y, food.y, ROWS);
          let key = null;
          if (dx !== 0) key = dx > 0 ? "ArrowRight" : "ArrowLeft";
          else if (dy !== 0) key = dy > 0 ? "ArrowDown" : "ArrowUp";
          if (key) {
            document.dispatchEvent(
              new KeyboardEvent("keydown", { key, bubbles: true }),
            );
          }
        }, 90);
      }),
    30_000,
  );
}

// Simon Says: the random sequence isn't in the DOM, but each step is shown by
// brightening a pad (inline `filter: brightness(...)`). We watch the four pads
// and record the flash order until it becomes our turn, then replay the taps.
async function playSimon(page) {
  const sequence = await page.evaluate(
    (timeoutMs) =>
      new Promise((resolve) => {
        const seq = [];
        const lit = { 0: false, 1: false, 2: false, 3: false };
        const start = Date.now();

        const iv = setInterval(() => {
          for (const id of [0, 1, 2, 3]) {
            const btn = document.getElementById("sm" + id);
            if (!btn) continue;
            const on = (btn.style.filter || "").includes("brightness");
            if (on && !lit[id]) {
              lit[id] = true;
              seq.push(id); // rising edge = one flash
            } else if (!on && lit[id]) {
              lit[id] = false;
            }
          }
          const status = document.getElementById("simon-status");
          const myTurn = status && /your turn/i.test(status.textContent);
          if (myTurn || Date.now() - start > timeoutMs) {
            clearInterval(iv);
            resolve(seq);
          }
        }, 25);
      }),
    20_000,
  );

  const letter = page.locator("#letter-view");
  for (const id of sequence) {
    await page.click(`#sm${id}`);
    await page.waitForTimeout(360); // tap flashes ~200ms, then unlocks
    if (await letter.isVisible()) return;
  }
}
