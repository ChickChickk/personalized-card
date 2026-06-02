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
    stage.innerHTML = `<div id="pGrd" style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; width:240px;"></div>`;
    const grid = document.getElementById("pGrd");
    let cards = ["🌸", "⭐", "🌸", "⭐", "🍀", "💎", "🍀", "💎"].sort(
      () => Math.random() - 0.5,
    );
    let active = [],
      matches = 0;
    cards.forEach((symbol, i) => {
      const tile = document.createElement("div");
      tile.style =
        "height:50px; background:#e76f51; border-radius:6px; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#e76f51; font-weight:bold;";
      tile.textContent = "?";
      tile.addEventListener("click", () => {
        if (
          tile.style.background === "rgb(255, 255, 255)" ||
          active.length >= 2
        )
          return;
        tile.style.background = "#fff";
        tile.textContent = symbol;
        active.push({ tile, symbol });
        if (active.length === 2) {
          if (active[0].symbol === active[1].symbol) {
            matches++;
            active = [];
            if (matches === 4) onComplete();
          } else {
            setTimeout(() => {
              active.forEach((a) => {
                a.tile.style.background = "#e76f51";
                a.tile.textContent = "?";
              });
              active = [];
            }, 600);
          }
        }
      });
      grid.appendChild(tile);
    });
    return null;
  },
};
