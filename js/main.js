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
    mode: "builder",
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

  function encodeCardData(cardData) {
    return btoa(encodeURIComponent(JSON.stringify(cardData)));
  }

  function decodeCardData(encodedData) {
    return JSON.parse(decodeURIComponent(atob(encodedData)));
  }

  function buildCardUrl(cardData) {
    const encodedData = encodeCardData(cardData);
    const baseUrl = `${window.location.origin}${window.location.pathname}`;

    return `${baseUrl}?mode=card&data=${encodedData}`;
  }

  function getCardDataFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const encodedData = params.get("data");

    if (mode !== "card" || !encodedData) {
      return null;
    }

    try {
      return decodeCardData(encodedData);
    } catch (error) {
      console.error("Failed to decode card data:", error);
      return null;
    }
  }

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
          .forEach((gameCard) => gameCard.classList.remove("is-selected"));

        card.classList.add("is-selected");

        if (previewGamePill) {
          previewGamePill.textContent = game.title;
        }

        if (prevLockMode) {
          prevLockMode.textContent = game.title;
        }

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

  function validateCardData() {
    const errors = [];

    if (!inputTo.value.trim()) {
      errors.push("Please enter who the card is for.");
    }

    if (!inputFrom.value.trim()) {
      errors.push("Please enter who the card is from.");
    }

    if (!inputMessage.value.trim()) {
      errors.push("Please write a message or generate a draft first.");
    }

    if (!state.selectedGame || !GAME_REGISTRY[state.selectedGame]) {
      errors.push("Please choose one mini game.");
    }

    return errors;
  }

  function createCardDataFromBuilder() {
    syncPreview();

    return {
      to: state.to,
      from: state.from,
      message: state.message,
      selectedGame: state.selectedGame,
    };
  }

  function openCardInNewTab(cardData) {
    const cardUrl = buildCardUrl(cardData);
    window.open(cardUrl, "_blank", "noopener,noreferrer");
  }

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
      if (previewGamePill) {
        previewGamePill.textContent = selectedGame.title;
      }

      if (prevLockMode) {
        prevLockMode.textContent = selectedGame.title;
      }
    }
  }

  function startCardMode(cardData) {
    state.mode = "card";
    state.to = cardData.to || "";
    state.from = cardData.from || "";
    state.message = cardData.message || "";
    state.selectedGame = cardData.selectedGame || "balloons";

    document.body.classList.add("mode-card");
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

  inputTo.addEventListener("input", syncPreview);
  inputFrom.addEventListener("input", syncPreview);
  inputMessage.addEventListener("input", syncPreview);

  btnMagicDraft.addEventListener("click", () => {
    const toneKey = helperToneSelect.value;
    const targetHelper = HELPER_REGISTRY[toneKey];

    if (!targetHelper) return;

    inputMessage.value = targetHelper.generate(
      inputTo.value.trim() || "someone special",
      helperDetail.value.trim(),
    );

    syncPreview();
  });

  formCreation.addEventListener("submit", (event) => {
    event.preventDefault();

    const errors = validateCardData();

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    const cardData = createCardDataFromBuilder();
    openCardInNewTab(cardData);
  });

  document.getElementById("btn-game-back").addEventListener("click", () => {
    stopActiveGame();

    if (state.mode === "card") {
      window.close();
      return;
    }

    viewGameplay.classList.add("hidden");
    viewBuilder.classList.remove("hidden");
  });

  document.getElementById("btn-letter-back").addEventListener("click", () => {
    if (state.mode === "card") {
      viewLetter.classList.add("hidden");
      viewGameplay.classList.remove("hidden");
      startSelectedGame();
      return;
    }

    viewLetter.classList.add("hidden");
    viewBuilder.classList.remove("hidden");

    formCreation.reset();
    syncPreview();
  });

  function initApp() {
    const cardData = getCardDataFromUrl();

    if (cardData) {
      startCardMode(cardData);
      return;
    }

    startBuilderMode();
  }

  initApp();
});
