const GameSimon = {
  id: "simon",
  title: "Simon Says",
  emoji: "🚨",
  description: "Repeat the flashing sequence pattern of buttons.",
  thumbnail: () => `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <style>
      .pad { animation: blink 2s ease-in-out infinite; }
      .pad:nth-child(2){ animation-delay:.5s }
      .pad:nth-child(3){ animation-delay:1s }
      .pad:nth-child(4){ animation-delay:1.5s }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.35} }
    </style>
    <rect class="pad" x="55"  y="20" width="40" height="40" rx="8" fill="#e76f51"/>
    <rect class="pad" x="105" y="20" width="40" height="40" rx="8" fill="#f4a261"/>
    <rect class="pad" x="55"  y="68" width="40" height="40" rx="8" fill="#2a9d8f"/>
    <rect class="pad" x="105" y="68" width="40" height="40" rx="8" fill="#e9c46a"/>
  </svg>`,

  start: function (stage, onComplete) {
    const PADS = [
      { id: 0, color: "#e76f51" },
      { id: 1, color: "#f4a261" },
      { id: 2, color: "#2a9d8f" },
      { id: 3, color: "#e9c46a" },
    ];

    // Fresh random sequence every single start() call — length 5 to 7
    const SEQ_LEN = 5 + Math.floor(Math.random() * 3);
    const sequence = Array.from(
      { length: SEQ_LEN },
      () => Math.floor(Math.random() * PADS.length)
    );

    stage.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:14px; font-family:var(--font-sans,sans-serif);">
        <p id="simon-status" style="font-size:0.88rem; color:#7a6e65; margin:0;">Watch the sequence…</p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; width:160px;">
          ${PADS.map(
            (p) => `<button
              id="sm${p.id}"
              disabled
              style="height:70px; background:${p.color}; border:none; border-radius:12px;
                     cursor:pointer; transition:filter 0.1s, transform 0.1s; opacity:0.75;"
            ></button>`
          ).join("")}
        </div>
        <p id="simon-progress" style="font-size:0.78rem; color:#7a6e65; margin:0;">— / ${SEQ_LEN}</p>
      </div>
    `;

    let userIdx = 0;
    let locked = true;

    function setStatus(text) {
      const el = document.getElementById("simon-status");
      if (el) el.textContent = text;
    }

    function setProgress(n) {
      const el = document.getElementById("simon-progress");
      if (el) el.textContent = `${n} / ${SEQ_LEN}`;
    }

    function setPadsEnabled(enabled) {
      PADS.forEach(({ id, color }) => {
        const btn = document.getElementById("sm" + id);
        if (!btn) return;
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? "1" : "0.75";
        btn.style.cursor = enabled ? "pointer" : "default";
      });
    }

    function flashPad(id, duration) {
      return new Promise((resolve) => {
        const btn = document.getElementById("sm" + id);
        if (!btn) { resolve(); return; }
        btn.style.filter = "brightness(1.75)";
        btn.style.transform = "scale(0.93)";
        setTimeout(() => {
          btn.style.filter = "";
          btn.style.transform = "";
          setTimeout(resolve, 80);
        }, duration);
      });
    }

    function delay(ms) {
      return new Promise((r) => setTimeout(r, ms));
    }

    async function playSequence() {
      locked = true;
      setPadsEnabled(false);
      setStatus("Watch the sequence…");
      setProgress("—");

      await delay(700);

      for (const id of sequence) {
        await flashPad(id, 420);
        await delay(130);
      }

      locked = false;
      setPadsEnabled(true);
      userIdx = 0;
      setStatus("Your turn! Repeat it.");
      setProgress(0);
    }

    PADS.forEach(({ id }) => {
      const btn = document.getElementById("sm" + id);
      if (!btn) return;

      btn.addEventListener("click", async () => {
        if (locked) return;
        locked = true;

        await flashPad(id, 200);

        if (id === sequence[userIdx]) {
          userIdx++;
          setProgress(userIdx);

          if (userIdx === sequence.length) {
            setStatus("Perfect! 🎉");
            onComplete();
            return;
          }

          locked = false;
        } else {
          setStatus("Oops! Watch again…");
          setPadsEnabled(false);
          await delay(700);
          playSequence();
        }
      });
    });

    playSequence();
    return null;
  },
};
