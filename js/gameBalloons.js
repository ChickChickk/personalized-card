const GameBalloons = {
  id: "balloons",
  title: "Balloons Burst",
  emoji: "🎈",
  description: "Pop 5 floating balloons before they cross.",
  thumbnail: () => `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        .b { animation: float 2s ease-in-out infinite alternate; }
        .b:nth-child(2) { animation-delay: 0.4s; }
        .b:nth-child(3) { animation-delay: 0.8s; }
        @keyframes float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }
      </style>
      <g class="b"><ellipse cx="50"  cy="65" rx="18" ry="22" fill="#e76f51" opacity="0.9"/>
        <line x1="50" y1="87" x2="50" y2="105" stroke="#aaa" stroke-width="1.5"/></g>
      <g class="b"><ellipse cx="100" cy="55" rx="20" ry="25" fill="#f4a261" opacity="0.9"/>
        <line x1="100" y1="80" x2="100" y2="105" stroke="#aaa" stroke-width="1.5"/></g>
      <g class="b"><ellipse cx="152" cy="65" rx="17" ry="21" fill="#e9c46a" opacity="0.9"/>
        <line x1="152" y1="86" x2="152" y2="105" stroke="#aaa" stroke-width="1.5"/></g>
    </svg>`,

  start: function (stage, onComplete) {
    stage.innerHTML = `<canvas id="bCvs" width="400" height="300" style="background:#eef7f9; display:block; cursor:pointer;"></canvas>`;
    const canvas = document.getElementById("bCvs"),
      ctx = canvas.getContext("2d");
    let score = 0,
      items = [],
      loopId;
    class Item {
      constructor() {
        this.x = Math.random() * 360 + 20;
        this.y = 320;
        this.r = 18;
        this.s = Math.random() * 1 + 1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = "#e76f51";
        ctx.fill();
      }
    }
    function tick() {
      ctx.clearRect(0, 0, 400, 300);
      if (Math.random() < 0.03 && items.length < 4) items.push(new Item());
      items.forEach((it, i) => {
        it.y -= it.s;
        it.draw();
        if (it.y < -20) items.splice(i, 1);
      });
      ctx.fillStyle = "#3d342e";
      ctx.fillText(`Pops: ${score}/5`, 10, 20);
      if (score < 5) loopId = requestAnimationFrame(tick);
    }
    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect(),
        mx = e.clientX - rect.left,
        my = e.clientY - rect.top;
      items.forEach((it, i) => {
        if (Math.hypot(it.x - mx, it.y - my) < it.r + 5) {
          items.splice(i, 1);
          score++;
          if (score >= 5) onComplete();
        }
      });
    });
    tick();
    return loopId;
  },
};
