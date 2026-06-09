const GameCatcher = {
  id: "catcher",
  title: "Star Catcher",
  emoji: "✨",
  description: "Slide your basket box to catch 5 falling stars.",
  thumbnail: () => `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <style>
      .heart { animation: fall 1.6s linear infinite; }
      .heart:nth-child(2){ animation-delay:.5s }
      .heart:nth-child(3){ animation-delay:1s }
      @keyframes fall { from{transform:translateY(-10px);opacity:1} to{transform:translateY(80px);opacity:0} }
    </style>
    <text class="heart" x="45"  y="30" font-size="20" text-anchor="middle">♥</text>
    <text class="heart" x="100" y="10" font-size="20" text-anchor="middle" fill="#e76f51">♥</text>
    <text class="heart" x="155" y="20" font-size="20" text-anchor="middle" fill="#f4a261">♥</text>
    <rect x="70" y="100" width="60" height="10" rx="5" fill="#e76f51"/>
  </svg>`,

  start: function (stage, onComplete) {
    const W = Math.min(400, (stage.clientWidth || 400) - 8);
    const H = 280;
    const BASKET_W = 64;
    const BASKET_H = 14;

    stage.innerHTML = `<canvas id="cCvs" width="${W}" height="${H}"
      style="background:#fef9f4; display:block; border-radius:8px; max-width:100%; touch-action:none;"></canvas>`;

    const canvas = document.getElementById("cCvs");
    const ctx = canvas.getContext("2d");

    let score = 0;
    let bx = W / 2 - BASKET_W / 2;
    let stars = [];
    let loopId;
    let done = false;

    function clampBasket(x) {
      return Math.max(0, Math.min(W - BASKET_W, x));
    }

    function toCanvasX(clientX) {
      const rect = canvas.getBoundingClientRect();
      return (clientX - rect.left) * (W / rect.width);
    }

    canvas.addEventListener("mousemove", (e) => {
      bx = clampBasket(toCanvasX(e.clientX) - BASKET_W / 2);
    });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      bx = clampBasket(toCanvasX(e.touches[0].clientX) - BASKET_W / 2);
    }, { passive: false });

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Basket
      ctx.fillStyle = "#e76f51";
      ctx.fillRect(bx, H - BASKET_H - 10, BASKET_W, BASKET_H);

      // Spawn star
      if (Math.random() < 0.025 && stars.length < 4) {
        stars.push({
          x: Math.random() * (W - 24) + 12,
          y: 0,
          speed: 1.8 + Math.random() * 1.2,
        });
      }

      const basketTop = H - BASKET_H - 10;

      stars = stars.filter((s) => {
        s.y += s.speed;
        ctx.font = "20px sans-serif";
        ctx.fillText("⭐", s.x - 10, s.y);

        const caught =
          s.y >= basketTop &&
          s.y <= basketTop + BASKET_H + s.speed + 4 &&
          s.x >= bx &&
          s.x <= bx + BASKET_W;

        if (caught) {
          score++;
          if (score >= 5 && !done) {
            done = true;
            cancelAnimationFrame(loopId);
            onComplete();
          }
          return false;
        }
        return s.y <= H;
      });

      ctx.fillStyle = "#3d342e";
      ctx.font = "14px sans-serif";
      ctx.fillText(`Stars: ${score} / 5`, 10, 22);

      if (!done) loopId = requestAnimationFrame(tick);
    }

    tick();
    return loopId;
  },
};
