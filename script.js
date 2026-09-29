// Reveal cards once as they enter the viewport
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i, 5) * 60}ms`;
  io.observe(el);
});

// Beat-driven waveform (home page only): a 4/4 groove at 96 BPM
const canvas = document.getElementById("wave");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BPM = 96, bars = 72;
  const kick = [0, 6, 10], snare = [4, 12]; // 16th-note grid
  const amps = new Array(bars).fill(0.08);
  let last = 0, step = 0;

  const fit = () => {
    const r = canvas.getBoundingClientRect(), d = devicePixelRatio || 1;
    canvas.width = r.width * d; canvas.height = r.height * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  };
  fit(); addEventListener("resize", fit);

  const draw = (t) => {
    const stepMs = 60000 / BPM / 4;
    if (t - last > stepMs) {
      last = t;
      const s = step % 16;
      const hit = kick.includes(s) ? 1 : snare.includes(s) ? 0.75 : s % 2 === 0 ? 0.3 : 0.12;
      amps.push(hit); amps.shift(); step++;
    }
    const { width: w, height: h } = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, w, h);
    const gap = w / bars;
    const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
    amps.forEach((a, i) => {
      const bh = Math.max(3, a * h);
      const fresh = i > bars - 4;
      ctx.fillStyle = fresh ? `hsl(${primary})` : `hsl(${primary} / ${0.18 + (i / bars) * 0.5})`;
      ctx.fillRect(i * gap + 1, (h - bh) / 2, Math.max(2, gap - 3), bh);
    });
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
}
