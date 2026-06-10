/**
 * Main Application Pipeline Controller
 */

const API_BASE = "https://personalized-card-steel.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  const state = {
    to: "",
    from: "",
    message: "",
    selectedGame: "balloons",
    activeLoopId: null,
    mode: "builder",
    currentCode: null,
  };

  const viewBuilder = document.getElementById("builder-view");
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
  const helperToneSelect = document.getElementById("helper-tone");
  const btnMagicDraft = document.getElementById("btn-magic-draft");
  const helperDetail = document.getElementById("helper-detail");
  const thumbnailContainer = document.getElementById("preview-game-thumbnail");
  const btnCopyLink = document.getElementById("btn-copy-link");
  const shareNote = document.querySelector(".share-note");
  const formErrors = document.getElementById("form-errors");
  const btnCreateCard = document.getElementById("btn-create-card");

  // ── API helpers ──────────────────────────────────────────────

  async function saveCard(cardData) {
    const res = await fetch(`${API_BASE}/api/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cardData),
    });
    if (!res.ok) throw new Error("Failed to save card");
    const { code } = await res.json();
    return code;
  }

  async function loadCard(code) {
    const res = await fetch(`${API_BASE}/api/cards/${code}`);
    if (!res.ok) return null;
    return res.json();
  }

  async function generateDraft(to, tone, detail) {
    const res = await fetch(`${API_BASE}/api/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, tone, detail }),
    });
    if (!res.ok) throw new Error("Draft generation failed");
    const { message } = await res.json();
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

  function initTones() {
    if (!helperToneSelect) return;
    helperToneSelect.innerHTML = "";
    Object.keys(HELPER_REGISTRY).forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = HELPER_REGISTRY[key].label;
      helperToneSelect.appendChild(option);
    });
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

      card.innerHTML = `
        <div class="card-identity-header">
          <span>${game.emoji}</span>
          <div class="game-card-title">${game.title}</div>
        </div>
        <div class="game-card-desc">${game.description}</div>
      `;

      card.addEventListener("click", () => {
        state.selectedGame = game.id;
        document
          .querySelectorAll(".game-mode-card")
          .forEach((c) => c.classList.remove("is-selected"));
        card.classList.add("is-selected");
        if (previewGamePill) previewGamePill.textContent = game.title;
        if (prevLockMode) prevLockMode.textContent = game.title;
        renderGameThumbnail(game.id);
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
    if (!inputFrom.value.trim()) errors.push("Please enter who the card is from.");
    if (!inputMessage.value.trim()) errors.push("Please write a message or generate a draft first.");
    if (!state.selectedGame || !GAME_REGISTRY[state.selectedGame]) errors.push("Please choose one mini game.");
    return errors;
  }

  function showFormErrors(errors) {
    formErrors.innerHTML = errors.map((e) => `<span>${e}</span>`).join("");
    formErrors.classList.remove("hidden");
    formErrors.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearFormErrors() {
    formErrors.classList.add("hidden");
    formErrors.innerHTML = "";
  }

  // ── App modes ────────────────────────────────────────────────

  function startBuilderMode() {
    state.mode = "builder";
    document.body.classList.add("mode-builder");
    document.body.classList.remove("mode-card");

    viewBuilder.classList.remove("hidden");
    viewGameplay.classList.add("hidden");
    viewLetter.classList.add("hidden");

    initTones();
    renderGames();
    syncPreview();
    renderGameThumbnail(state.selectedGame);

    const selectedGame = GAME_REGISTRY[state.selectedGame];
    if (selectedGame) {
      if (previewGamePill) previewGamePill.textContent = selectedGame.title;
      if (prevLockMode) prevLockMode.textContent = selectedGame.title;
    }
  }

  function startCardMode(cardData) {
    state.mode = "card";
    state.to = cardData.to || "";
    state.from = cardData.from || "";
    state.message = cardData.message || "";
    state.selectedGame = cardData.selectedGame || "balloons";

    const params = new URLSearchParams(window.location.search);
    const isCreatorPreview = params.get("preview") === "1";
    const isSharedLink = !isCreatorPreview;

    document.body.classList.add("mode-card");
    document.body.classList.toggle("mode-shared-link", isSharedLink);
    document.body.classList.toggle("mode-creator-preview", !isSharedLink);
    document.body.classList.remove("mode-builder");

    viewBuilder.classList.add("hidden");
    viewLetter.classList.add("hidden");
    viewGameplay.classList.remove("hidden");

    startSelectedGame();
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

    state.activeLoopId = game.start(stage, () => {
      viewGameplay.classList.add("hidden");
      viewLetter.classList.remove("hidden");
      document.getElementById("final-to").textContent = state.to;
      document.getElementById("final-from").textContent = state.from;
      document.getElementById("final-message").textContent = state.message;
    });
  }

  function stopActiveGame() {
    if (!state.activeLoopId) return;
    cancelAnimationFrame(state.activeLoopId);
    clearInterval(state.activeLoopId);
    state.activeLoopId = null;
  }

  // ── Event listeners ──────────────────────────────────────────

  inputTo.addEventListener("input", () => { syncPreview(); clearFormErrors(); });
  inputFrom.addEventListener("input", () => { syncPreview(); clearFormErrors(); });
  inputMessage.addEventListener("input", () => { syncPreview(); clearFormErrors(); });

  btnMagicDraft.addEventListener("click", async () => {
    const toneKey = helperToneSelect.value;
    btnMagicDraft.textContent = "Writing…";
    btnMagicDraft.disabled = true;

    try {
      const text = await generateDraft(
        inputTo.value.trim() || "someone special",
        toneKey,
        helperDetail.value.trim()
      );
      inputMessage.value = text;
      syncPreview();
    } catch {
      // Fall back to template helper if API fails
      const targetHelper = HELPER_REGISTRY[toneKey];
      if (targetHelper) {
        inputMessage.value = targetHelper.generate(
          inputTo.value.trim() || "someone special",
          helperDetail.value.trim()
        );
        syncPreview();
      }
    } finally {
      btnMagicDraft.textContent = "Write me a draft ✨";
      btnMagicDraft.disabled = false;
    }
  });

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

    const confettiColors = ["#e76f51", "#f4a26a", "#f7c59f", "#ffffff", "#f4d03f", "#e8a0bf"];
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

      const cardUrl = buildCardUrl(code, { preview: true });
      history.pushState(null, "", cardUrl);
      state.createdInPlace = true;

      startCardMode({
        to: state.to,
        from: state.from,
        message: state.message,
        selectedGame: state.selectedGame,
      });

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
          shareNote.textContent = "Link copied ✓ Anyone with this link can open the card.";
          shareNote.classList.add("is-copied");
        }
        if (btnCopyLink) {
          btnCopyLink.textContent = "Copied ✓";
          setTimeout(() => { btnCopyLink.textContent = "Copy share link 🔗"; }, 1600);
        }
      } catch {
        if (shareNote) {
          shareNote.textContent = "Copy failed. You can manually copy the URL from the address bar.";
          shareNote.classList.remove("is-copied");
        }
      }
    });
  }

  document.getElementById("font-slider").addEventListener("input", (e) => {
    document.getElementById("final-message").style.fontSize = e.target.value / 100 + "rem";
  });

  document.getElementById("btn-game-back").addEventListener("click", () => {
    stopActiveGame();
    if (state.mode === "card" && !state.createdInPlace) {
      window.close();
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname;
      }, 150);
      return;
    }
    history.pushState(null, "", window.location.origin + window.location.pathname);
    state.createdInPlace = false;
    inputTo.value = state.to;
    inputFrom.value = state.from;
    inputMessage.value = state.message;
    startBuilderMode();
  });

  document.getElementById("btn-letter-back").addEventListener("click", () => {
    window.close();
    // Fallback if window.close() is blocked by the browser
    setTimeout(() => {
      window.location.href = window.location.origin + window.location.pathname;
    }, 150);
  });

  // ── Init ─────────────────────────────────────────────────────

  async function initApp() {
    const code = new URLSearchParams(window.location.search).get("c");
    const cardData = await getCardDataFromUrl();
    if (cardData) {
      state.currentCode = code;
      startCardMode(cardData);
      return;
    }
    startBuilderMode();
  }

  initApp();
});
