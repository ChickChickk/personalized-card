const GameSnake = {
  id: "snake",
  title: "Micro Snake",
  emoji: "🐍",
  description: "Use screen buttons or arrow keys to eat 5 pieces of food.",
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
    const CELL = 22;
    const COLS = Math.floor(Math.min(420, (stage.clientWidth || 420) - 4) / CELL);
    const ROWS = 14;
    const W = COLS * CELL;
    const H = ROWS * CELL;
    const TARGET = 5;

    stage.style.padding = "0";

    stage.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:10px; font-family:var(--font-sans,sans-serif); width:100%;">
        <p id="snake-count" style="font-size:0.88rem; color:#7a6e65; margin:0;">Eat ${TARGET} pieces of food</p>
        <canvas id="sCvs" width="${W}" height="${H}" style="background:#3d342e; display:block; width:100%; max-width:${W}px;"></canvas>
        <div style="display:flex; gap:8px;">
          <button id="skL" class="btn-secondary" style="width:52px; height:40px; font-size:1.1rem;">↺</button>
          <button id="skR" class="btn-secondary" style="width:52px; height:40px; font-size:1.1rem;">↻</button>
        </div>
        <p style="font-size:0.75rem; color:#7a6e65; margin:0;">or use arrow keys</p>
      </div>
    `;

    const canvas = document.getElementById("sCvs");
    const ctx = canvas.getContext("2d");

    let snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    let dir = "R";
    let food = { x: 2, y: 2 };
    let count = 0;
    let done = false;

    const TURN_LEFT  = { R: "U", U: "L", L: "D", D: "R" };
    const TURN_RIGHT = { R: "D", D: "L", L: "U", U: "R" };
    const ARROW_MAP  = { ArrowRight: "R", ArrowLeft: "L", ArrowUp: "U", ArrowDown: "D" };

    function randomFood() {
      let pos;
      do {
        pos = {
          x: Math.floor(Math.random() * COLS),
          y: Math.floor(Math.random() * ROWS),
        };
      } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
      return pos;
    }

    food = randomFood();

    document.getElementById("skL").addEventListener("click", () => {
      if (!done) dir = TURN_LEFT[dir];
    });
    document.getElementById("skR").addEventListener("click", () => {
      if (!done) dir = TURN_RIGHT[dir];
    });

    function handleKey(e) {
      if (ARROW_MAP[e.key]) {
        e.preventDefault();
        dir = ARROW_MAP[e.key];
      }
    }
    document.addEventListener("keydown", handleKey);

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Subtle grid dots
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      for (let gx = 0; gx < COLS; gx++) {
        for (let gy = 0; gy < ROWS; gy++) {
          ctx.beginPath();
          ctx.arc(gx * CELL + CELL / 2, gy * CELL + CELL / 2, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Food — bright circle so it's always visible
      const fx = food.x * CELL + CELL / 2;
      const fy = food.y * CELL + CELL / 2;
      const fr = CELL / 2 - 2;
      ctx.fillStyle = "#e9c46a";
      ctx.beginPath();
      ctx.arc(fx, fy, fr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(fx - fr * 0.28, fy - fr * 0.28, fr * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // Snake body then head on top
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "#e76f51" : "#f4a261";
        ctx.beginPath();
        ctx.roundRect(s.x * CELL + 2, s.y * CELL + 2, CELL - 4, CELL - 4, 4);
        ctx.fill();
      });
    }

    function step() {
      const head = { ...snake[0] };
      if (dir === "R") head.x++;
      if (dir === "L") head.x--;
      if (dir === "U") head.y--;
      if (dir === "D") head.y++;

      // Wrap around walls
      head.x = (head.x + COLS) % COLS;
      head.y = (head.y + ROWS) % ROWS;

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        count++;
        const el = document.getElementById("snake-count");
        if (el) el.textContent = `${count} / ${TARGET} eaten`;

        if (count >= TARGET) {
          done = true;
          clearInterval(intervalId);
          document.removeEventListener("keydown", handleKey);
          draw();
          onComplete();
          return;
        }
        food = randomFood();
      } else {
        snake.pop();
      }

      draw();
    }

    draw();
    const intervalId = setInterval(step, 170);
    return intervalId;
  },
};
