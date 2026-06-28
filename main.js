/**
 * Main Application Pipeline Controller
 */

// Empty = same-origin relative paths (e.g. "/api/cards").
// Frontend and API are served together on Vercel, so no domain needed.
const API_BASE = "";

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    to: "",
    from: "",
    message: "",
    selectedGame: "balloons",
    activeLoopId: null,
    mode: "builder",
    currentCode: null,
    length: "short",
  };

  const viewBuilder = document.getElementById("builder-view");
  const viewSuccess = document.getElementById("success-view");
  const viewGameplay = document.getElementById("gameplay-view");
  const viewLetter = document.getElementById("letter-view");
  const formCreation = document.getElementById("creation-form");

  const inputTo = document.getElementById("input-to");
  const inputFrom = document.getElementById("input-from");
  const inputMessage = document.getElementById("input-message");

  const prevTo = document.getElementById("prev-to");
  const prevFrom = document.getElementById("prev-from");
  const prevMessage = document.getElementById("prev-message");
  const previewGamePill = document.getElementById("preview-game-pill");
  const prevLockMode = document.getElementById("prev-lock-mode");

  const gameCardsContainer = document.getElementById("game-cards-container");
  const btnMagicDraft = document.getElementById("btn-magic-draft");
  const helperPrompt = document.getElementById("helper-prompt");
  const thumbnailContainer = document.getElementById("preview-game-thumbnail");
  const btnCopyLink = document.getElementById("btn-copy-link");
  const shareNote = document.querySelector(".share-note");
  const shareLinkInput = document.getElementById("share-link-input");
  const btnPreviewRecipient = document.getElementById("btn-preview-recipient");
  const btnSeeMessage = document.getElementById("btn-see-message");
  const btnCreateAnother = document.getElementById("btn-create-another");
  const formErrors = document.getElementById("form-errors");
  const btnCreateCard = document.getElementById("btn-create-card");

  // ── API helpers ──────────────────────────────────────────────

  async function saveCard(cardData) {
    const res = await fetch(`${API_BASE}/api/cards`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(cardData),
    });
    if (!res.ok) throw new Error("Failed to save card");
    const {code} = await res.json();
    return code;
  }

  async function loadCard(code) {
    const res = await fetch(`${API_BASE}/api/cards/${code}`);
    if (!res.ok) return null;
    return res.json();
  }

  async function generateDraft(prompt) {
    const res = await fetch(`${API_BASE}/api/draft`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        prompt,
        length: state.length,
      }),
    });
    if (!res.ok) throw new Error("Draft generation failed");
    const {message} = await res.json();
    return message;
  }

  // ── URL helpers ──────────────────────────────────────────────

  function buildCardUrl(code, options = {}) {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const previewParam = options.preview ? "&preview=1" : "";
    return `${baseUrl}?c=${code}${previewParam}`;
  }

  async function getCardDataFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("c");
    if (!code) return null;
    try {
      return await loadCard(code);
    } catch (error) {
      console.error("Failed to load card:", error);
      return null;
    }
  }

  function getShareUrl() {
    return buildCardUrl(state.currentCode);
  }

  // ── Preview ──────────────────────────────────────────────────

  function renderGameThumbnail(gameId) {
    const game = GAME_REGISTRY[gameId];
    if (game && game.thumbnail && thumbnailContainer) {
      thumbnailContainer.innerHTML = game.thumbnail();
    }
  }

  function renderGames() {
    if (!gameCardsContainer) return;
    gameCardsContainer.innerHTML = "";

    Object.keys(GAME_REGISTRY).forEach((key) => {
      const game = GAME_REGISTRY[key];

      const card = document.createElement("div");
      card.className = `game-mode-card ${
        state.selectedGame === game.id ? "is-selected" : ""
      }`;
      card.setAttribute("data-game-id", game.id);
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="card-identity-header">
          <span>${game.emoji}</span>
          <div class="game-card-title">${game.title}</div>
        </div>
        <div class="game-card-desc">${game.description}</div>
      `;

      card.addEventListener("click", () => {
        card.focus();
        state.selectedGame = game.id;
        document
          .querySelectorAll(".game-mode-card")
          .forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        if (previewGamePill) previewGamePill.textContent = game.title;
        if (prevLockMode) prevLockMode.textContent = game.title;
        renderGameThumbnail(game.id);
      });

      // Enter on a chosen game creates the card; Space selects it.
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          formCreation.requestSubmit();
        } else if (event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          card.click();
        }
      });

      gameCardsContainer.appendChild(card);
    });
  }

  function syncPreview() {
    state.to = inputTo.value.trim();
    state.from = inputFrom.value.trim();
    state.message = inputMessage.value;

    prevTo.textContent = state.to || "someone special";
    prevFrom.textContent = state.from || "you";
    prevMessage.textContent =
      state.message.trim() || "Your message will appear here as you write.";

    if (state.message.trim()) {
      prevMessage.classList.remove("preview-text-placeholder");
    } else {
      prevMessage.classList.add("preview-text-placeholder");
    }
  }

  // ── Validation & errors ──────────────────────────────────────

  function validateCardData() {
    const errors = [];
    if (!inputTo.value.trim()) errors.push("Please enter who the card is for.");
    if (!inputFrom.value.trim())
      errors.push("Please enter who the card is from.");
    if (!inputMessage.value.trim())
      errors.push("Please write a message or generate a draft first.");
    if (!state.selectedGame || !GAME_REGISTRY[state.selectedGame])
      errors.push("Please choose one mini game.");
    return errors;
  }

  function showFormErrors(errors) {
    formErrors.innerHTML = errors.map((e) => `<span>${e}</span>`).join("");
    formErrors.classList.remove("hidden");
    formErrors.scrollIntoView({behavior: "smooth", block: "nearest"});
  }

  function clearFormErrors() {
    formErrors.classList.add("hidden");
    formErrors.innerHTML = "";
  }

  // ── App modes ────────────────────────────────────────────────

  function currentCardData() {
    return {
      to: state.to,
      from: state.from,
      message: state.message,
      selectedGame: state.selectedGame,
    };
  }

  function hideAllViews() {
    viewBuilder.classList.add("hidden");
    viewSuccess.classList.add("hidden");
    viewGameplay.classList.add("hidden");
    viewLetter.classList.add("hidden");
  }

  function startBuilderMode() {
    state.mode = "builder";
    document.body.classList.add("mode-builder");
    document.body.classList.remove(
      "mode-card",
      "mode-shared-link",
      "mode-creator-preview",
    );

    hideAllViews();
    viewBuilder.classList.remove("hidden");

    renderGames();
    syncPreview();
    renderGameThumbnail(state.selectedGame);

    const selectedGame = GAME_REGISTRY[state.selectedGame];
    if (selectedGame) {
      if (previewGamePill) previewGamePill.textContent = selectedGame.title;
      if (prevLockMode) prevLockMode.textContent = selectedGame.title;
    }

    scheduleFit();
  }

  // Sender-only screen shown right after a card is created: surfaces the share
  // link and lets the sender optionally preview without being forced to play.
  function showSuccessView() {
    state.mode = "success";
    document.body.classList.add("mode-card", "mode-creator-preview");
    document.body.classList.remove("mode-builder", "mode-shared-link");

    hideAllViews();
    viewSuccess.classList.remove("hidden");

    document.getElementById("success-to").textContent = state.to || "—";
    document.getElementById("success-from").textContent = state.from || "—";
    const game = GAME_REGISTRY[state.selectedGame];
    document.getElementById("success-game").textContent = game
      ? game.title
      : state.selectedGame;

    if (shareLinkInput) shareLinkInput.value = getShareUrl();
    if (shareNote) {
      shareNote.textContent = "Anyone with this link can open the card.";
      shareNote.classList.remove("is-copied");
    }
    if (btnCopyLink) btnCopyLink.textContent = "Copy 🔗";
  }

  function startCardMode(cardData, isCreatorPreview = false) {
    state.mode = "card";
    state.to = cardData.to || "";
    state.from = cardData.from || "";
    state.message = cardData.message || "";
    state.selectedGame = cardData.selectedGame || "balloons";

    const isSharedLink = !isCreatorPreview;

    document.body.classList.add("mode-card");
    document.body.classList.toggle("mode-shared-link", isSharedLink);
    document.body.classList.toggle("mode-creator-preview", isCreatorPreview);
    document.body.classList.remove("mode-builder");

    hideAllViews();
    viewGameplay.classList.remove("hidden");

    startSelectedGame();
  }

  function revealLetter() {
    hideAllViews();
    viewLetter.classList.remove("hidden");
    document.getElementById("final-to").textContent = state.to;
    document.getElementById("final-from").textContent = state.from;
    document.getElementById("final-message").textContent = state.message;
  }

  function startSelectedGame() {
    const game = GAME_REGISTRY[state.selectedGame];
    if (!game) {
      console.error(`Game "${state.selectedGame}" does not exist.`);
      return;
    }

    document.getElementById("game-icon-display").textContent = game.emoji;
    document.getElementById("game-title-display").textContent = game.title;
    document.getElementById("game-desc-display").textContent = game.description;

    const stage = document.getElementById("game-engine-stage");
    stage.innerHTML = "";

    state.activeLoopId = game.start(stage, revealLetter);
  }

  function stopActiveGame() {
    if (!state.activeLoopId) return;
    // A game may return a teardown function (cancels its own timers and
    // removes its own event listeners) or a raw timer/frame id.
    if (typeof state.activeLoopId === "function") {
      state.activeLoopId();
    } else {
      cancelAnimationFrame(state.activeLoopId);
      clearInterval(state.activeLoopId);
    }
    state.activeLoopId = null;
  }

  // ── Event listeners ──────────────────────────────────────────

  inputTo.addEventListener("input", () => {
    syncPreview();
    clearFormErrors();
  });
  inputFrom.addEventListener("input", () => {
    syncPreview();
    clearFormErrors();
  });
  inputMessage.addEventListener("input", () => {
    syncPreview();
    clearFormErrors();
  });

  async function runMagicDraft() {
    const prompt = helperPrompt.value.trim();
    if (!prompt) {
      helperPrompt.focus();
      return;
    }

    btnMagicDraft.textContent = "Generating…";
    btnMagicDraft.disabled = true;

    const composerCore = document.querySelector(".composer-core");
    const heartbeatOverlay = document.getElementById("heartbeat-overlay");
    composerCore.classList.add("generating");
    heartbeatOverlay.classList.remove("hidden");

    try {
      const text = await generateDraft(prompt);
      inputMessage.value = text;
      syncPreview();
    } catch (err) {
      console.error("Draft generation failed:", err);
      // Fall back to a random template helper if API fails
      const keys = Object.keys(HELPER_REGISTRY);
      const fallback =
        HELPER_REGISTRY[keys[Math.floor(Math.random() * keys.length)]];
      if (fallback) {
        inputMessage.value = fallback.generate(
          inputTo.value.trim() || "someone special",
          "",
        );
        syncPreview();
      }
    } finally {
      composerCore.classList.remove("generating");
      heartbeatOverlay.classList.add("hidden");
      btnMagicDraft.textContent = "Generate ✨";
      btnMagicDraft.disabled = false;
      // Keep focus in the prompt so Enter can re-generate.
      helperPrompt.focus();
    }
  }

  btnMagicDraft.addEventListener("click", runMagicDraft);

  // Enter inside the prompt box means "Generate", not "Create card".
  helperPrompt.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runMagicDraft();
    }
  });

  // ── Helper controls: length toggle + idea conveyor belt ──

  // Length segmented control (always has exactly one active option).
  const lengthRow = document.getElementById("length-row");
  if (lengthRow) {
    lengthRow.addEventListener("click", (e) => {
      const seg = e.target.closest(".seg");
      if (!seg) return;
      lengthRow
        .querySelectorAll(".seg")
        .forEach((s) => s.classList.remove("is-active"));
      seg.classList.add("is-active");
      state.length = seg.dataset.length;
      // Return focus to the prompt so Enter still triggers Generate.
      helperPrompt.focus();
    });
  }

  // Idea slider: drag to scroll sideways with the mouse, tap a chip to fill the
  // prompt box. A tap that turns into a drag should scroll, not fill the box.
  const ideaSlider = document.getElementById("idea-slider");
  if (ideaSlider) {
    let isDown = false;
    let dragged = false;
    let startX = 0;
    let startScroll = 0;

    ideaSlider.addEventListener("pointerdown", (e) => {
      isDown = true;
      dragged = false;
      startX = e.clientX;
      startScroll = ideaSlider.scrollLeft;
    });
    ideaSlider.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) dragged = true;
      ideaSlider.scrollLeft = startScroll - dx;
      if (dragged) ideaSlider.classList.add("is-dragging");
    });
    const endDrag = () => {
      isDown = false;
      ideaSlider.classList.remove("is-dragging");
    };
    ideaSlider.addEventListener("pointerup", endDrag);
    ideaSlider.addEventListener("pointerleave", endDrag);

    ideaSlider.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip-idea");
      if (!chip || dragged) return;
      // Fill with exactly the chip's visible text — what you tap is what you get.
      helperPrompt.value = chip.textContent.trim();
      helperPrompt.focus();
    });
  }

  formCreation.addEventListener("submit", async (event) => {
    event.preventDefault();

    const errors = validateCardData();
    if (errors.length > 0) {
      showFormErrors(errors);
      return;
    }

    clearFormErrors();
    syncPreview();

    btnCreateCard.disabled = true;

    const overlay = document.getElementById("loading-overlay");
    const loadingMsg = document.getElementById("loading-message");

    const messages = [
      "Sealing your envelope…",
      "Preparing the best message for your loved one…",
      "Sprinkling a little magic on it…",
      "Almost ready, hang tight…",
    ];
    let msgIndex = 0;
    loadingMsg.textContent = messages[0];
    overlay.classList.remove("hidden", "fade-out");

    const confettiColors = [
      "#e76f51",
      "#f4a26a",
      "#f7c59f",
      "#ffffff",
      "#f4d03f",
      "#e8a0bf",
    ];
    const confettiPieces = [];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 2}s;
        animation-duration: ${1.8 + Math.random() * 1.6}s;
        background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
        width: ${6 + Math.random() * 6}px;
        height: ${6 + Math.random() * 6}px;
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        transform: rotate(${Math.random() * 360}deg);
      `;
      overlay.appendChild(piece);
      confettiPieces.push(piece);
    }

    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      loadingMsg.textContent = messages[msgIndex];
    }, 1800);

    try {
      const cardData = {
        to: state.to,
        from: state.from,
        message: state.message,
        selectedGame: state.selectedGame,
      };

      const code = await saveCard(cardData);
      state.currentCode = code;

      clearInterval(msgInterval);
      loadingMsg.textContent = "Your card is ready! 🎉";

      state.createdInPlace = true;
      showSuccessView();

      await new Promise((r) => setTimeout(r, 400));
      overlay.classList.add("fade-out");
      await new Promise((r) => setTimeout(r, 400));
      overlay.classList.add("hidden");
      overlay.classList.remove("fade-out");
      confettiPieces.forEach((p) => p.remove());
    } catch {
      clearInterval(msgInterval);
      confettiPieces.forEach((p) => p.remove());
      overlay.classList.add("hidden");
      showFormErrors(["Could not save the card. Please try again."]);
    } finally {
      btnCreateCard.disabled = false;
    }
  });

  if (btnCopyLink) {
    btnCopyLink.addEventListener("click", async () => {
      const shareUrl = getShareUrl();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const tempInput = document.createElement("textarea");
          tempInput.value = shareUrl;
          tempInput.setAttribute("readonly", "");
          tempInput.style.cssText = "position:fixed;left:-9999px;";
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand("copy");
          document.body.removeChild(tempInput);
        }
        if (shareNote) {
          shareNote.textContent =
            "Link copied ✓ Anyone with this link can open the card.";
          shareNote.classList.add("is-copied");
        }
        if (btnCopyLink) {
          btnCopyLink.textContent = "Copied ✓";
          setTimeout(() => {
            btnCopyLink.textContent = "Copy 🔗";
          }, 1600);
        }
      } catch {
        if (shareNote) {
          shareNote.textContent =
            "Copy failed. You can manually copy the URL from the address bar.";
          shareNote.classList.remove("is-copied");
        }
      }
    });
  }

  // Success screen → optionally play through the card as the recipient would.
  if (btnPreviewRecipient) {
    btnPreviewRecipient.addEventListener("click", () => {
      startCardMode(currentCardData(), true);
    });
  }

  // Success screen → jump straight to the message, skipping the game.
  if (btnSeeMessage) {
    btnSeeMessage.addEventListener("click", () => {
      document.body.classList.add("mode-card", "mode-creator-preview");
      document.body.classList.remove("mode-builder", "mode-shared-link");
      revealLetter();
    });
  }

  // Success screen → start a fresh card.
  if (btnCreateAnother) {
    btnCreateAnother.addEventListener("click", () => {
      history.pushState(
        null,
        "",
        window.location.origin + window.location.pathname,
      );
      state.createdInPlace = false;
      state.currentCode = null;
      inputTo.value = "";
      inputFrom.value = "";
      inputMessage.value = "";
      helperPrompt.value = "";
      startBuilderMode();
    });
  }

  document.getElementById("font-slider").addEventListener("input", (e) => {
    document.getElementById("final-message").style.fontSize =
      e.target.value / 100 + "rem";
  });

  document.getElementById("btn-game-back").addEventListener("click", () => {
    stopActiveGame();
    // Sender previewing their own card → back to the success screen.
    if (state.createdInPlace) {
      showSuccessView();
      return;
    }
    // Recipient via a share link → go back, or fall back to a fresh builder.
    goBackOrHome();
  });

  document.getElementById("btn-letter-back").addEventListener("click", () => {
    // Sender previewing their own card → back to the success screen.
    if (state.createdInPlace) {
      showSuccessView();
      return;
    }
    goBackOrHome();
  });

  // Browsers block window.close() on tabs the script didn't open, so prefer the
  // history back-step; if there's no history to return to, land on the builder.
  function goBackOrHome() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = window.location.origin + window.location.pathname;
    }
  }

  // ── Init ─────────────────────────────────────────────────────

  // ── Adaptive fit ─────────────────────────────────────────────
  // Scale the builder so it always fits the viewport without scrolling, on any
  // screen. We measure the builder's natural height (at scale 1) and shrink only
  // as much as needed. This replaces the old hardcoded height media-query tiers.
  const docEl = document.documentElement;
  let fitScheduled = false;

  function fitBuilder() {
    // Only the builder is auto-fit; other views keep their own scroll layout.
    // Below the desktop breakpoint we let the page scroll naturally.
    if (viewBuilder.classList.contains("hidden") || window.innerWidth < 1024) {
      docEl.style.setProperty("--desktop-scale", "1");
      return;
    }
    // Reset to 1, then read scrollHeight — the read forces a synchronous layout,
    // so we measure the true natural height before the browser paints.
    docEl.style.setProperty("--desktop-scale", "1");
    const natural = viewBuilder.scrollHeight;
    // Hold back room for the body's vertical padding, the fixed footer, and a
    // small safety margin so the Create button never sits flush against the edge.
    const RESERVED = 100;
    const available = window.innerHeight - RESERVED;
    const scale = Math.max(0.6, Math.min(1, available / natural));
    docEl.style.setProperty("--desktop-scale", scale.toFixed(3));
  }

  // Coalesce bursts of triggers (resize, observer, fonts) into one fit per frame.
  function scheduleFit() {
    if (fitScheduled) return;
    fitScheduled = true;
    requestAnimationFrame(() => {
      fitScheduled = false;
      fitBuilder();
    });
  }

  window.addEventListener("resize", scheduleFit);
  if (window.ResizeObserver) {
    new ResizeObserver(scheduleFit).observe(viewBuilder);
  }
  // Web fonts change text height once loaded; refit when they're ready.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleFit);
  }

  async function initApp() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("c");
    const isCreatorPreview = params.get("preview") === "1";
    const cardData = await getCardDataFromUrl();
    if (cardData) {
      state.currentCode = code;
      startCardMode(cardData, isCreatorPreview);
      return;
    }
    startBuilderMode();
  }

  initApp();
});
