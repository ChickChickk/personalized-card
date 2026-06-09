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
  const btnCopyLink = document.getElementById("btn-copy-link");
  const shareNote = document.querySelector(".share-note");
  const formErrors = document.getElementById("form-errors");

  function encodeCardData(cardData) {
    return LZString.compressToEncodedURIComponent(JSON.stringify(cardData));
  }

  function decodeCardData(encodedData) {
    return JSON.parse(LZString.decompressFromEncodedURIComponent(encodedData));
  }

  function buildCardUrl(cardData, options = {}) {
    const encodedData = encodeCardData(cardData);
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const previewParam = options.preview ? "&preview=1" : "";

    return `${baseUrl}?mode=card&data=${encodedData}${previewParam}`;
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
    const cardUrl = buildCardUrl(cardData, { preview: true });
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

  function getShareUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("preview");
    return url.toString();
  }

  async function copyShareLink() {
    const shareUrl = getShareUrl();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement("textarea");
        tempInput.value = shareUrl;
        tempInput.setAttribute("readonly", "");
        tempInput.style.position = "fixed";
        tempInput.style.left = "-9999px";

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
          btnCopyLink.textContent = "Copy share link 🔗";
        }, 1600);
      }
    } catch (error) {
      console.error("Failed to copy share link:", error);

      if (shareNote) {
        shareNote.textContent =
          "Copy failed. You can manually copy the URL from the address bar.";
        shareNote.classList.remove("is-copied");
      }
    }
  }
  inputTo.addEventListener("input", () => { syncPreview(); clearFormErrors(); });
  inputFrom.addEventListener("input", () => { syncPreview(); clearFormErrors(); });
  inputMessage.addEventListener("input", () => { syncPreview(); clearFormErrors(); });

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

  function showFormErrors(errors) {
    formErrors.innerHTML = errors.map((e) => `<span>${e}</span>`).join("");
    formErrors.classList.remove("hidden");
    formErrors.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearFormErrors() {
    formErrors.classList.add("hidden");
    formErrors.innerHTML = "";
  }

  formCreation.addEventListener("submit", (event) => {
    event.preventDefault();

    const errors = validateCardData();

    if (errors.length > 0) {
      showFormErrors(errors);
      return;
    }

    clearFormErrors();
    const cardData = createCardDataFromBuilder();
    openCardInNewTab(cardData);
  });

  if (btnCopyLink) {
    btnCopyLink.addEventListener("click", copyShareLink);
  }

  const FONT_SIZES = ["0.9rem", "1.1rem", "1.3rem", "1.6rem"];
  let fontSizeIdx = 1;

  function applyLetterFontSize() {
    document.getElementById("final-message").style.fontSize = FONT_SIZES[fontSizeIdx];
  }

  document.getElementById("btn-font-down").addEventListener("click", () => {
    fontSizeIdx = Math.max(0, fontSizeIdx - 1);
    applyLetterFontSize();
  });

  document.getElementById("btn-font-up").addEventListener("click", () => {
    fontSizeIdx = Math.min(FONT_SIZES.length - 1, fontSizeIdx + 1);
    applyLetterFontSize();
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
    window.close();
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
