const GameClicker = {
  id: "clicker",
  title: "Cookie Clicker",
  emoji: "🍪",
  description: "Click the giant cookie 10 times quickly.",
  thumbnail: () => `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <style>
      @keyframes pop { 0%{r:28} 50%{r:34} 100%{r:28} }
      .btn { animation: pop 1s ease-in-out infinite; }
    </style>
    <circle class="btn" cx="100" cy="60" r="28" fill="#e76f51"/>
    <text x="100" y="66" font-size="13" text-anchor="middle" fill="#fff" font-family="sans-serif">TAP!</text>
    <text x="155" y="30" font-size="11" fill="#f4a261" font-family="sans-serif">+1</text>
    <text x="165" y="50" font-size="10" fill="#e9c46a" font-family="sans-serif">+1</text>
  </svg>`,

  start: function (stage, onComplete) {
    const TOTAL = 10;
    let count = 0;

    stage.style.position = "relative";
    stage.style.width = "100%";
    stage.style.height = "300px";

    stage.innerHTML = `
      <p id="clk-counter" style="
        position:absolute; top:12px; left:50%; transform:translateX(-50%);
        font-size:0.88rem; font-weight:600; color:#7a6e65;
        font-family:var(--font-sans,sans-serif); white-space:nowrap; margin:0;">
        0 / ${TOTAL}
      </p>
      <div id="clk-cookie" style="
        position:absolute; cursor:pointer; user-select:none; line-height:1;
        transition:font-size 0.15s ease, transform 0.1s ease; font-size:72px;">
        🍪
      </div>
    `;

    const cookie = document.getElementById("clk-cookie");
    const counter = document.getElementById("clk-counter");

    // 72px → 38px as count goes 0 → 9
    function currentSize() {
      return Math.round(72 - count * 3.8);
    }

    function jumpToRandom() {
      const size = currentSize();
      const padding = 16;
      const maxX = Math.max(0, stage.clientWidth - size - padding * 2);
      const maxY = Math.max(0, stage.clientHeight - size - padding * 2);
      cookie.style.fontSize = size + "px";
      cookie.style.left = padding + Math.random() * maxX + "px";
      cookie.style.top = padding + Math.random() * maxY + "px";
    }

    // First placement after layout settles
    setTimeout(jumpToRandom, 50);

    function handleHit(e) {
      e.preventDefault();
      count++;
      counter.textContent = `${count} / ${TOTAL}`;
      cookie.style.transform = "scale(0.78)";

      if (count >= TOTAL) {
        counter.textContent = `${TOTAL} / ${TOTAL} 🎉`;
        onComplete();
        return;
      }

      setTimeout(() => {
        cookie.style.transform = "scale(1)";
        jumpToRandom();
      }, 110);
    }

    cookie.addEventListener("mousedown", handleHit);
    cookie.addEventListener("touchstart", handleHit, { passive: false });

    return null;
  },
};
