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
    let count = 0;
    stage.innerHTML = `
            <div style="text-align:center;">
                <div id="clkC" style="font-size:4rem; cursor:pointer; user-select:none; transition:transform 0.1s;">🍪</div>
                <div id="clkTxt" style="font-weight:600; margin-top:10px;">Clicks: 0 / 10</div>
            </div>`;
    const cookie = document.getElementById("clkC");
    cookie.addEventListener("mousedown", () => {
      count++;
      cookie.style.transform = "scale(0.85)";
      document.getElementById("clkTxt").textContent = `Clicks: ${count} / 10`;
      if (count >= 10) onComplete();
    });
    cookie.addEventListener("mouseup", () => {
      cookie.style.transform = "scale(1)";
    });
    return null;
  },
};
