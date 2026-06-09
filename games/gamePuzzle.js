const GamePuzzle = {
  id: "puzzle",
  title: "Memory Match",
  emoji: "🧩",
  description: "Match the hidden pairs symbols correctly.",
  thumbnail: () => `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <style>
      .tile { animation: pulse 1.8s ease-in-out infinite alternate; }
      .tile:nth-child(2){ animation-delay:.3s }
      .tile:nth-child(3){ animation-delay:.6s }
      @keyframes pulse { from{opacity:1} to{opacity:0.5} }
    </style>
    <rect x="30"  y="20" width="42" height="42" rx="6" fill="#e76f51" class="tile"/>
    <rect x="80"  y="20" width="42" height="42" rx="6" fill="#f4a261" class="tile"/>
    <rect x="130" y="20" width="42" height="42" rx="6" fill="#e9c46a" class="tile"/>
    <rect x="30"  y="70" width="42" height="42" rx="6" fill="#e9c46a" class="tile"/>
    <rect x="80"  y="70" width="42" height="42" rx="6" fill="#e76f51" class="tile"/>
    <rect x="130" y="70" width="18" height="18" rx="4" fill="none" stroke="#ccc" stroke-dasharray="4" stroke-width="1.5"/>
  </svg>`,

  start: function (stage, onComplete) {
    const SYMBOLS = ["🌸", "⭐", "🍀", "💎"];
    const cards = [...SYMBOLS, ...SYMBOLS].sort(() => Math.random() - 0.5);

    stage.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:12px; font-family:var(--font-sans,sans-serif);">
        <p id="match-status" style="font-size:0.88rem; color:#7a6e65; margin:0;">Find all 4 pairs</p>
        <div id="pGrd" style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; width:260px;"></div>
      </div>
    `;

    const grid = document.getElementById("pGrd");
    let flipped = [];
    let matches = 0;
    let locked = false;

    function setStatus(text) {
      const el = document.getElementById("match-status");
      if (el) el.textContent = text;
    }

    cards.forEach((symbol) => {
      const tile = document.createElement("div");
      tile.dataset.symbol = symbol;
      tile.dataset.state = "hidden";
      tile.style.cssText = `
        height:54px; border-radius:8px; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        font-size:1.4rem; font-weight:700; user-select:none;
        background:#e76f51; color:#fff;
        border:2px solid transparent;
        transition:background 0.2s, border-color 0.2s;
      `;
      tile.textContent = "?";

      tile.addEventListener("click", () => {
        if (locked || tile.dataset.state !== "hidden") return;

        // Flip face-up
        tile.dataset.state = "flipped";
        tile.style.background = "#fff";
        tile.style.color = "inherit";
        tile.style.borderColor = "#e76f51";
        tile.textContent = symbol;
        flipped.push(tile);

        if (flipped.length < 2) return;

        locked = true;
        const [a, b] = flipped;
        flipped = [];

        if (a.dataset.symbol === b.dataset.symbol) {
          [a, b].forEach((t) => {
            t.dataset.state = "matched";
            t.style.background = "rgba(42,157,143,0.12)";
            t.style.borderColor = "#2a9d8f";
            t.style.cursor = "default";
          });
          matches++;
          locked = false;
          if (matches === SYMBOLS.length) {
            setStatus("All matched! 🎉");
            onComplete();
          }
        } else {
          setStatus("Not a match, try again…");
          setTimeout(() => {
            [a, b].forEach((t) => {
              t.dataset.state = "hidden";
              t.style.background = "#e76f51";
              t.style.color = "#fff";
              t.style.borderColor = "transparent";
              t.textContent = "?";
            });
            locked = false;
            setStatus("Find all 4 pairs");
          }, 750);
        }
      });

      grid.appendChild(tile);
    });

    return null;
  },
};
