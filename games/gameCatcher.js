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
    stage.innerHTML = `<canvas id="cCvs" width="400" height="300" style="background:#2c3e50; display:block;"></canvas>`;
    const canvas = document.getElementById("cCvs"),
      ctx = canvas.getContext("2d");
    let score = 0,
      bx = 170,
      stars = [],
      loopId;
    canvas.addEventListener("mousemove", (e) => {
      bx = e.clientX - canvas.getBoundingClientRect().left - 30;
    });
    function tick() {
      ctx.clearRect(0, 0, 400, 300);
      ctx.fillStyle = "#e67e22";
      ctx.fillRect(bx, 270, 60, 15);
      if (Math.random() < 0.03 && stars.length < 3)
        stars.push({ x: Math.random() * 380 + 10, y: 0 });
      stars.forEach((s, i) => {
        s.y += 2;
        ctx.fillStyle = "#f1c40f";
        ctx.fillText("⭐", s.x, s.y);
        if (s.y >= 270 && s.x >= bx && s.x <= bx + 60) {
          stars.splice(i, 1);
          score++;
          if (score >= 5) onComplete();
        } else if (s.y > 300) stars.splice(i, 1);
      });
      ctx.fillStyle = "#fff";
      ctx.fillText(`Stars: ${score}/5`, 10, 20);
      if (score < 5) loopId = requestAnimationFrame(tick);
    }
    tick();
    return loopId;
  },
};
