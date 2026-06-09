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
    const W = Math.min(400, (stage.clientWidth || 400) - 8);
    const H = 280;
    const COLORS = ["#e76f51", "#f4a261", "#e9c46a", "#2a9d8f"];

    stage.innerHTML = `<canvas id="bCvs" width="${W}" height="${H}"
      style="background:#fef9f4; display:block; cursor:pointer; border-radius:8px; max-width:100%;"></canvas>`;

    const canvas = document.getElementById("bCvs");
    const ctx = canvas.getContext("2d");

    let score = 0;
    let items = [];
    let loopId;
    let done = false;

    class Balloon {
      constructor() {
        this.x = Math.random() * (W - 40) + 20;
        this.y = H + 20;
        this.r = 16 + Math.random() * 8;
        this.speed = 0.8 + Math.random() * 1.2;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      draw() {
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.r * 0.85, this.r, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.r);
        ctx.lineTo(this.x, this.y + this.r + 18);
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      if (Math.random() < 0.025 && items.length < 5) {
        items.push(new Balloon());
      }

      // filter instead of splice-in-forEach — avoids skipping items
      items = items.filter((b) => {
        b.y -= b.speed;
        b.draw();
        return b.y > -40;
      });

      ctx.fillStyle = "#3d342e";
      ctx.font = "14px sans-serif";
      ctx.fillText(`Pops: ${score} / 5`, 10, 22);

      if (!done) loopId = requestAnimationFrame(tick);
    }

    function getCanvasPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const src = e.touches ? e.touches[0] : e;
      return {
        x: (src.clientX - rect.left) * scaleX,
        y: (src.clientY - rect.top) * scaleY,
      };
    }

    function tryPop(e) {
      e.preventDefault();
      if (done) return;
      const { x, y } = getCanvasPos(e);
      let popped = false;
      items = items.filter((b) => {
        if (!popped && Math.hypot(b.x - x, b.y - y) < b.r + 8) {
          popped = true;
          score++;
          if (score >= 5) {
            done = true;
            cancelAnimationFrame(loopId);
            onComplete();
          }
          return false;
        }
        return true;
      });
    }

    canvas.addEventListener("mousedown", tryPop);
    canvas.addEventListener("touchstart", tryPop, { passive: false });

    tick();
    return loopId;
  },
};
