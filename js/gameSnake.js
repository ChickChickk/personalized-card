const GameSnake = {
  id: "snake",
  title: "Micro Snake",
  emoji: "🐍",
  description: "Use screen buttons to eat 3 pieces of food.",
  thumbnail: () => `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <style>
      @keyframes slither { from{stroke-dashoffset:40} to{stroke-dashoffset:0} }
      .snake { animation: slither 1s linear infinite; }
    </style>
    <path class="snake" d="M20,60 Q50,30 80,60 Q110,90 140,60 Q160,45 180,60"
      fill="none" stroke="#e76f51" stroke-width="10" stroke-linecap="round"
      stroke-dasharray="8 4"/>
    <circle cx="180" cy="60" r="7" fill="#3d342e"/>
    <circle cx="183" cy="57" r="2" fill="#fff"/>
  </svg>`,

  start: function (stage, onComplete) {
    stage.innerHTML = `
            <div style="text-align:center;">
                <canvas id="sCvs" width="200" height="200" style="background:#000; display:block; margin:0 auto;"></canvas>
                <div style="margin-top:8px;"><button id="skL" class="btn-secondary">◀</button> <button id="skR" class="btn-secondary">▶</button></div>
            </div>`;
    const canvas = document.getElementById("sCvs"),
      ctx = canvas.getContext("2d");
    let snake = [{ x: 100, y: 100 }],
      f = { x: 40, y: 40 },
      d = "R",
      count = 0,
      intervalId;
    document.getElementById("skL").addEventListener("click", () => {
      d = d === "R" ? "U" : d === "U" ? "L" : d === "L" ? "D" : "R";
    });
    document.getElementById("skR").addEventListener("click", () => {
      d = d === "R" ? "D" : d === "D" ? "L" : d === "L" ? "U" : "R";
    });
    function step() {
      let head = { ...snake[0] };
      if (d === "R") head.x += 20;
      if (d === "L") head.x -= 20;
      if (d === "U") head.y -= 20;
      if (d === "D") head.y += 20;
      snake.unshift(head);
      if (Math.abs(head.x - f.x) < 15 && Math.abs(head.y - f.y) < 15) {
        count++;
        f = {
          x: Math.floor(Math.random() * 9) * 20,
          y: Math.floor(Math.random() * 9) * 20,
        };
        if (count >= 3) {
          clearInterval(intervalId);
          onComplete();
        }
      } else {
        snake.pop();
      }
      ctx.clearRect(0, 0, 200, 200);
      ctx.fillStyle = "red";
      ctx.fillRect(f.x, f.y, 15, 15);
      ctx.fillStyle = "green";
      snake.forEach((s) => ctx.fillRect(s.x, s.y, 18, 18));
    }
    intervalId = setInterval(step, 250);
    return intervalId;
  },
};
