/**
 * Main Application Pipeline Controller
 */
document.addEventListener("DOMContentLoaded", () => {
  const state = {
    to: "",
    from: "",
    message: "",
    selectedGame: "balloons",
    activeLoopId: null,
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
  const thumbnailContainer = document.getElementById("preview-game-thumbnail"); // ← moved here, top-level

  // ── NEW: render animated thumbnail in preview ──────────────────────────────
  function renderGameThumbnail(gameId) {
    const game = GAME_REGISTRY[gameId];
    if (game && game.thumbnail) {
      thumbnailContainer.innerHTML = game.thumbnail();
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  function initTones() {
    helperToneSelect.innerHTML = "";
    Object.keys(HELPER_REGISTRY).forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = HELPER_REGISTRY[key].label;
      helperToneSelect.appendChild(option);
    });
  }

  function renderGames() {
    gameCardsContainer.innerHTML = "";
    Object.keys(GAME_REGISTRY).forEach((key) => {
      const game = GAME_REGISTRY[key];
      const card = document.createElement("div");
      card.className = `game-mode-card ${state.selectedGame === game.id ? "is-selected" : ""}`;
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
        previewGamePill.textContent = game.title;
        prevLockMode.textContent = game.title;
        renderGameThumbnail(game.id); // ← calls the function defined above
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
    if (state.message.trim())
      prevMessage.classList.remove("preview-text-placeholder");
    else prevMessage.classList.add("preview-text-placeholder");
  }

  inputTo.addEventListener("input", syncPreview);
  inputFrom.addEventListener("input", syncPreview);
  inputMessage.addEventListener("input", syncPreview);

  btnMagicDraft.addEventListener("click", () => {
    const toneKey = helperToneSelect.value;
    const targetHelper = HELPER_REGISTRY[toneKey];
    if (targetHelper) {
      inputMessage.value = targetHelper.generate(
        inputTo.value.trim() || "someone special",
        helperDetail.value.trim(),
      );
      syncPreview();
    }
  });

  formCreation.addEventListener("submit", (e) => {
    e.preventDefault();
    viewBuilder.classList.add("hidden");
    viewGameplay.classList.remove("hidden");

    const game = GAME_REGISTRY[state.selectedGame];
    document.getElementById("game-icon-display").textContent = game.emoji;
    document.getElementById("game-title-display").textContent = game.title;
    document.getElementById("game-desc-display").textContent = game.description;

    const stage = document.getElementById("game-engine-stage");
    state.activeLoopId = game.start(stage, () => {
      viewGameplay.classList.add("hidden");
      viewLetter.classList.remove("hidden");
      document.getElementById("final-to").textContent = state.to;
      document.getElementById("final-from").textContent = state.from;
      document.getElementById("final-message").textContent = state.message;
    });
  });

  document.getElementById("btn-game-back").addEventListener("click", () => {
    if (state.activeLoopId) {
      cancelAnimationFrame(state.activeLoopId);
      clearInterval(state.activeLoopId);
    }
    viewGameplay.classList.add("hidden");
    viewBuilder.classList.remove("hidden");
  });

  document.getElementById("btn-letter-back").addEventListener("click", () => {
    viewLetter.classList.add("hidden");
    viewBuilder.classList.remove("hidden");
    formCreation.reset();
    syncPreview();
  });

  initTones();
  renderGames();
  renderGameThumbnail(state.selectedGame); // ← shows balloons thumbnail on load
});
