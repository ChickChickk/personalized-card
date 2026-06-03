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
    stage.innerHTML = `<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; width:160px;"><button id="sm0" style="height:60px; background:red; border:none; border-radius:8px;"></button><button id="sm1" style="height:60px; background:blue; border:none; border-radius:8px;"></button></div>`;
    let sequence = [0, 1, 0],
      userIdx = 0;
    function flash(id) {
      const btn = document.getElementById("sm" + id);
      if (!btn) return;
      btn.style.opacity = "0.3";
      setTimeout(() => (btn.style.opacity = "1"), 300);
    }
    setTimeout(() => {
      flash(0);
      setTimeout(() => {
        flash(1);
        setTimeout(() => flash(0), 400);
      }, 400);
    }, 500);
    [0, 1].forEach((id) => {
      document.getElementById("sm" + id).addEventListener("click", () => {
        flash(id);
        if (id === sequence[userIdx]) {
          userIdx++;
          if (userIdx === sequence.length) onComplete();
        } else userIdx = 0;
      });
    });
    return null;
  },
};
