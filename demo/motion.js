/* ANUI Motion — vanilla JS patterns. No deps, no network. */
(() => {
const S = window.ANUISpring, PR = window.ANUI_PRESETS, d = document, root = d.documentElement;
const q = (s, r = d) => r.querySelector(s), qa = (s, r = d) => [...r.querySelectorAll(s)];
const RM = () => root.classList.contains("rm") || matchMedia("(prefers-reduced-motion: reduce)").matches;
const params = new URLSearchParams(location.search);
window.__frames = [];

/* ── toggles: reduced motion + sound (off by default) ── */
const tgRM = q("#tgRM"), tgS = q("#tgSnd");
const setRM = (on) => { root.classList.toggle("rm", on); tgRM.setAttribute("aria-pressed", on); try { localStorage.setItem("anui-rm", on ? 1 : 0); } catch (e) {} };
let saved = null; try { saved = localStorage.getItem("anui-rm"); } catch (e) {}
setRM(params.has("rm") || saved === "1");
tgRM.onclick = () => setRM(!root.classList.contains("rm"));
let ac = null, sound = false;
tgS.onclick = () => { sound = !sound; tgS.setAttribute("aria-pressed", sound); if (sound && !ac) ac = new (window.AudioContext || window.webkitAudioContext)(); blip(1600, 0.012); };
/* tiny click: 1 oscillator, 10–25ms exponential envelope, −30 dBFS-ish */
function blip(freq = 2000, dur = 0.01, gain = 0.03, type = "sine") {
  if (!sound || !ac) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + dur);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.01);
}
d.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) blip(2200, 0.008, 0.025); }, true);

/* ── spotlight (hover light-follow) on every component stage + lab cards ── */
const addSpot = () => qa(".stage, .m-card").forEach((el) => el.classList.add("m-spot"));
addSpot(); new MutationObserver(addSpot).observe(q("#sections"), { childList: true });
d.addEventListener("pointermove", (e) => { const el = e.target.closest && e.target.closest(".m-spot"); if (!el) return;
  const r = el.getBoundingClientRect(); el.style.setProperty("--mx", e.clientX - r.left + "px"); el.style.setProperty("--my", e.clientY - r.top + "px"); }, { passive: true });

/* ── magnetic buttons: all send buttons + [data-magnetic]; pull ≤ 6px, release on pop spring ── */
const magnet = () => qa('[data-magnetic], button[aria-label="发送"], button.send').forEach((b) => { if (b.__mag) return; b.__mag = 1; b.classList.add("m-mag");
  const zone = b.parentElement;
  zone.addEventListener("pointermove", (e) => { if (RM()) return; const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), dist = Math.hypot(dx, dy);
    if (dist > 70) { b.classList.remove("live"); b.style.transform = ""; return; }
    b.classList.add("live"); const pull = (Math.min(dist, 40) / 40) * 6; b.style.transform = `translate(${(dx / Math.max(dist, 1)) * pull}px, ${(dy / Math.max(dist, 1)) * pull}px)`; });
  zone.addEventListener("pointerleave", () => { b.classList.remove("live"); b.style.transform = ""; }); });
magnet(); setTimeout(magnet, 1500);

/* ── Motion Lab: spring playground ── */
const plot = q("#plot"), ctx = plot.getContext("2d"), ball = q("#ball");
const K = q("#k"), C = q("#c"), M = q("#m"), V = q("#v");
let cur = { ...PR.pop }, ballSpring;
const chips = q("#presets");
Object.entries(PR).forEach(([n, p]) => { const b = d.createElement("button"); b.className = "m-chip m-press"; b.textContent = n; b.dataset.p = n;
  b.onclick = () => { load(n); play(); }; chips.appendChild(b); });
function load(n) { cur = { ...PR[n] }; K.value = cur.stiffness; C.value = cur.damping; M.value = 1; V.value = 0; qa("[data-p]").forEach((x) => x.setAttribute("aria-pressed", x.dataset.p === n)); draw(); }
function params_() { return { stiffness: +K.value, damping: +C.value, mass: +M.value }; }
function css_(c) { const s = getComputedStyle(root); return s.getPropertyValue(c).trim(); }
function draw() {
  const p = params_(), v0 = +V.value, f = S.solve(p, v0), T = Math.max(0.3, Math.min(3, S.settle(p, v0) * 1.15)), W = plot.width, H = plot.height, pad = 24;
  q("#ko").textContent = (+K.value).toFixed(0); q("#co").textContent = (+C.value).toFixed(1); q("#mo").textContent = (+M.value).toFixed(2); q("#vo").textContent = (+V.value).toFixed(1);
  const z = p.damping / (2 * Math.sqrt(p.stiffness * p.mass)); let mx = 0; for (let t = 0; t < T; t += 0.002) mx = Math.max(mx, f(t));
  const lin = S.toLinear(p, 32, v0);
  q("#stats").innerHTML = `ζ = ${z.toFixed(2)}，过冲 ${Math.max(0, (mx - 1) * 100).toFixed(1)}%，稳定 ${lin.duration}ms`;
  q("#css").textContent = `transition: transform ${lin.duration}ms ${lin.easing};`;
  ctx.clearRect(0, 0, W, H); const ink = css_("--ink"), line = css_("--line-strong");
  ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  const Y = (y) => H - pad - y * (H - pad * 2) / 1.3; ctx.beginPath(); ctx.moveTo(pad, Y(1)); ctx.lineTo(W - pad, Y(1)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = ink; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let i = 0; i <= 300; i++) { const t = (T * i) / 300, x = pad + (W - pad * 2) * (i / 300), y = Y(f(t)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  plot.__T = T; plot.__f = f;
}
[K, C, M, V].forEach((el) => el.addEventListener("input", () => { qa("[data-p]").forEach((x) => x.setAttribute("aria-pressed", false)); draw(); }));
const trackW = () => ball.parentElement.clientWidth - 36;
ballSpring = new S.Spring(params_(), (x) => { ball.style.transform = `translateX(${x * trackW()}px)`; });
let side = 0;
function play() { ballSpring.p = params_(); if (RM()) { side = 1 - side; ballSpring.jump(side); return; } side = 1 - side; ballSpring.set(side, side ? +V.value : -V.value); blip(1200, 0.02); }
q("#play").onclick = play;
q("#retarget").onclick = () => { play(); setTimeout(() => play(), 120); }; /* interrupt mid-flight: velocity is preserved */
q("#copy").onclick = (e) => { navigator.clipboard && navigator.clipboard.writeText(q("#css").textContent).catch(() => {}); e.currentTarget.textContent = "已复制"; setTimeout(() => (e.currentTarget.textContent = "复制 CSS"), 1200); };
load("pop");

/* ── toasts: enter spring / exit ease-in, stack, interruptible ── */
const toasts = q("#toasts"); let tn = 0;
const relayout = () => qa(".m-toast:not([data-state=exit])", toasts).reverse().forEach((t, i) => { t.style.setProperty("--i", i); t.style.zIndex = 10 - i; });
q("#toastAdd").onclick = () => { const t = d.createElement("div"); t.className = "m-toast"; t.dataset.state = "enter";
  t.innerHTML = `<span class="m-presence" style="width:14px;height:14px"></span>任务 #${++tn} 已完成，3 个文件已修改`; toasts.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.dataset.state = "idle"; relayout(); })); blip(1500, 0.03);
  const live = qa(".m-toast:not([data-state=exit])", toasts); if (live.length > 3) dismiss(live[0]); };
function dismiss(t) { if (!t) return; t.dataset.state = "exit"; relayout(); setTimeout(() => t.remove(), 200); }
q("#toastDel").onclick = () => { const live = qa(".m-toast:not([data-state=exit])", toasts); dismiss(live[live.length - 1]); };

/* ── stagger + FLIP reorder ── */
const list = q("#list"), ITEMS = ["读取仓库结构", "分析依赖图", "生成迁移计划", "修改 12 个文件", "运行测试", "撰写变更说明", "提交 PR", "通知评审"];
function stagger() { list.innerHTML = ITEMS.map((t, i) => `<div class="m-item in" style="--i:${Math.min(i, 5)}" data-k="${i}"><span class="m-mono" style="color:var(--ink-3)">${String(i + 1).padStart(2, "0")}</span>${t}</div>`).join(""); }
stagger(); q("#stagger").onclick = stagger;
function flip(container, mutate, preset = PR.glide) {
  const els = [...container.children], first = new Map(els.map((e) => [e, e.getBoundingClientRect()])); mutate();
  if (RM()) return; const lin = S.toLinear(preset, 32);
  els.forEach((e) => { const a = first.get(e), b = e.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top; if (!dx && !dy) return;
    e.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], { duration: lin.duration, easing: lin.easing }); });
}
q("#shuffle").onclick = () => flip(list, () => { const k = [...list.children]; k.forEach((e) => e.classList.remove("in")); for (let i = k.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [k[i], k[j]] = [k[j], k[i]]; } k.forEach((e) => list.appendChild(e)); });

/* ── shared element (FLIP scale+translate from tile to detail) ── */
const tiles = q("#tiles"); tiles.innerHTML = ["记忆", "文件", "日志", "成员", "设置", "用量"].map((t) => `<div class="m-tile m-press" tabindex="0">${t}</div>`).join("");
tiles.addEventListener("click", (e) => { const t = e.target.closest(".m-tile"); if (!t) return; const a = t.getBoundingClientRect();
  const opening = !t.classList.contains("open"); qa(".m-tile.open", tiles).forEach((x) => x !== t && x.classList.remove("open"));
  t.classList.toggle("open", opening); t.innerHTML = opening ? `<b style="font-size:14px">${t.textContent}</b><span class="m-c">共享元素：同一个节点从格子过渡到详情</span>` : t.querySelector("b").textContent;
  if (RM()) return; const b = t.getBoundingClientRect(), lin = S.toLinear(PR.glide, 32);
  t.animate([{ transform: `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${a.width / b.width},${a.height / b.height})` }, { transform: "none" }], { duration: lin.duration, easing: lin.easing }); blip(900, 0.03); });

/* ── drag + rubber band + velocity fling + snap ── */
const rail = q("#rail"), puck = q("#puck"), out = q("#flingOut");
const rubber = (x, dim, c = 0.55) => (1 - 1 / ((x * c) / dim + 1)) * dim; /* iOS rubber-band */
let px = 0, pv = 0, dragging = false, sx = 0, ox = 0, samples = [];
const max = () => rail.clientWidth - 64, slots = () => [0, max() / 2, max()];
const pSpring = new S.Spring(PR.fling, (x) => { px = x; puck.style.transform = `translateX(${x}px)`; });
puck.addEventListener("pointerdown", (e) => { dragging = true; puck.setPointerCapture(e.pointerId); sx = e.clientX; ox = px; samples = [[performance.now(), e.clientX]]; pSpring.raf && cancelAnimationFrame(pSpring.raf); pSpring.raf = 0; pSpring.x = px; });
puck.addEventListener("pointermove", (e) => { if (!dragging) return; let x = ox + e.clientX - sx; const M = max();
  if (x < 0) x = -rubber(-x, rail.clientWidth); else if (x > M) x = M + rubber(x - M, rail.clientWidth);
  px = x; puck.style.transform = `translateX(${x}px)`; samples.push([performance.now(), e.clientX]); samples = samples.filter((s) => performance.now() - s[0] < 100); });
puck.addEventListener("pointerup", () => { if (!dragging) return; dragging = false; const a = samples[0], b = samples[samples.length - 1];
  const v = b && a && b[0] > a[0] ? ((b[1] - a[1]) / (b[0] - a[0])) * 1000 : 0; /* px/s */
  const projected = px + (v / 1000) * 0.998 / (1 - 0.998); /* UIScrollView normal deceleration projection */
  const target = slots().reduce((m, s) => (Math.abs(s - projected) < Math.abs(m - projected) ? s : m));
  out.textContent = `v = ${v.toFixed(0)} px/s，投射 ${projected.toFixed(0)}px → 吸附 ${target.toFixed(0)}px`;
  pSpring.x = px; if (RM()) return pSpring.jump(target); const span = target - px || 1; pSpring.v = v; pSpring.set(target); blip(700, 0.04); });

/* ── sheet: drag to dismiss by distance or velocity ── */
const sheet = q("#sheet"), wrap = q("#sheetwrap"); let sy = 0, sd = false, sv = [], sOff = 0;
const shSpring = new S.Spring(PR.sheet, (y) => { sOff = y; sheet.style.transform = `translateY(${y}px)`; });
sheet.addEventListener("pointerdown", (e) => { sd = true; sheet.setPointerCapture(e.pointerId); sy = e.clientY - sOff; sv = [[performance.now(), e.clientY]]; cancelAnimationFrame(shSpring.raf); shSpring.raf = 0; });
sheet.addEventListener("pointermove", (e) => { if (!sd) return; let y = e.clientY - sy; if (y < 0) y = -rubber(-y, 150, 0.3); shSpring.x = y; sOff = y; sheet.style.transform = `translateY(${y}px)`; sv.push([performance.now(), e.clientY]); sv = sv.filter((s) => performance.now() - s[0] < 100); });
sheet.addEventListener("pointerup", () => { sd = false; const a = sv[0], b = sv[sv.length - 1], v = b && a && b[0] > a[0] ? ((b[1] - a[1]) / (b[0] - a[0])) * 1000 : 0;
  const close = sOff > 60 || v > 500; shSpring.v = v; RM() ? shSpring.jump(close ? 170 : 0) : shSpring.set(close ? 170 : 0); });
wrap.addEventListener("click", (e) => { if (e.target === wrap && sOff > 100) { RM() ? shSpring.jump(0) : shSpring.set(0); } });

/* ── AI motion: one full agent run ── */
const tools = q("#tools"), ms = q("#mstream"), barb = q("#barb"), bar = q("#bar"), pres = q("#presence"), lbl = q("#thinkLbl"), slot = q("#apprSlot");
let prog = 0; const progSpring = new S.Spring(PR.settle, (x) => { barb.style.transform = `scaleX(${Math.max(0, x)})`; });
const setProg = (p) => { prog = Math.max(prog, p); RM() ? progSpring.jump(prog) : progSpring.set(prog); }; /* never moves backwards */
const sleep = (ms_) => new Promise((r) => setTimeout(r, ms_)); /* DEMO ONLY: real UI is event-driven */
const TEXT = "我已读取 3 个模块，并确认 AuthContext 的 18 处调用。建议先拆分 store，再逐个替换调用点，每一步都可以单独回滚。".match(/[\u4e00-\u9fa5]{1,2}|[A-Za-z0-9]+|\s+|./g);
let running = false;
async function run() {
  if (running) return; running = true; tools.innerHTML = ""; ms.innerHTML = ""; slot.innerHTML = ""; prog = 0; progSpring.jump(0);
  pres.classList.remove("idle"); lbl.textContent = "正在思考"; bar.classList.add("ind"); await sleep(700); bar.classList.remove("ind");
  for (const [t, ms_] of [["读取 src/auth", 500], ["搜索 useAuth", 600], ["运行测试", 900]]) {
    const c = d.createElement("span"); c.className = "m-tool"; c.innerHTML = `<span class="s"></span>${t}`; tools.appendChild(c); blip(1800, 0.015);
    setProg(prog + 0.15); await sleep(ms_); c.classList.add("done"); blip(2600, 0.01); }
  lbl.textContent = "正在回复";
  for (const tk of TEXT) { const s = d.createElement("span"); s.className = "m-tok"; s.textContent = tk; ms.appendChild(s); setProg(0.45 + 0.4 * (ms.childElementCount / TEXT.length)); await sleep(RM() ? 0 : 38); }
  const a = d.createElement("div"); a.className = "m-appr in"; a.innerHTML = `<div class="m-t">允许执行 <span class="m-mono">rm -rf dist/</span>？</div><div class="m-c">需要你确认后 Agent 才会继续</div>
    <div class="m-row" style="margin-top:10px;justify-content:flex-end"><button class="m-btn m-press" data-a="no">拒绝</button><button class="m-btn pri m-press" data-a="ok">允许</button></div>`;
  slot.appendChild(a); lbl.textContent = "等待你的确认"; pres.classList.add("idle"); blip(900, 0.05, 0.03, "triangle");
  const nudge = setTimeout(() => { a.classList.remove("in"); void a.offsetWidth; a.classList.add("nudge"); }, 4000); /* one-time attention nudge, never loops */
  a.onclick = (e) => { const b = e.target.closest("[data-a]"); if (!b) return; clearTimeout(nudge); a.classList.add("out"); setTimeout(() => (a.remove()), 160);
    setProg(1); lbl.textContent = b.dataset.a === "ok" ? "已完成" : "已停止"; running = false; };
}
q("#run").onclick = run;

/* ── light effects: WebGL spotlight + grain shimmer (fallback 2D) ── */
const gl_c = q("#gl"), fxgl = q("#fxgl"); let mouse = [0.5, 0.4], target = [0.5, 0.4];
fxgl.addEventListener("pointermove", (e) => { const r = fxgl.getBoundingClientRect(); target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; });
(function webgl() {
  const gl = gl_c.getContext("webgl", { premultipliedAlpha: false, antialias: false }); if (!gl) return;
  const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const fs = `precision mediump float;uniform vec2 r;uniform vec2 m;uniform float t;
   float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
   void main(){vec2 uv=gl_FragCoord.xy/r;vec2 a=vec2(r.x/r.y,1.);float d=length((uv-m)*a);
   float spot=exp(-d*d*6.)*.32+exp(-d*d*40.)*.18;float g=(h(floor(gl_FragCoord.xy)+floor(t*24.))-.5)*.06;
   float v=clamp(spot+g*(.4+spot*2.),0.,1.);gl_FragColor=vec4(vec3(v),1.);}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pg = gl.createProgram(); gl.attachShader(pg, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pg); gl.useProgram(pg);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pg, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const ur = gl.getUniformLocation(pg, "r"), um = gl.getUniformLocation(pg, "m"), ut = gl.getUniformLocation(pg, "t");
  let vis = true; new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(fxgl); /* budget: pause offscreen */
  const fr = (now) => { requestAnimationFrame(fr); if (!vis) return; const w = gl_c.clientWidth * Math.min(2, devicePixelRatio), hh = gl_c.clientHeight * Math.min(2, devicePixelRatio);
    if (gl_c.width !== w) { gl_c.width = w; gl_c.height = hh; gl.viewport(0, 0, w, hh); }
    const k = RM() ? 1 : 0.12; mouse = [mouse[0] + (target[0] - mouse[0]) * k, mouse[1] + (target[1] - mouse[1]) * k]; /* lagged follow */
    gl.uniform2f(ur, w, hh); gl.uniform2f(um, mouse[0], mouse[1]); gl.uniform1f(ut, RM() ? 0 : now / 1000); gl.drawArrays(gl.TRIANGLES, 0, 3); };
  requestAnimationFrame(fr);
})();
(function spec() { const c = q("#spec2d"), x = c.getContext("2d"); let vis = true; new IntersectionObserver(([e]) => (vis = e.isIntersecting)).observe(c);
  const fr = (now) => { requestAnimationFrame(fr); if (!vis) return; const w = (c.width = c.clientWidth * 2), h = (c.height = c.clientHeight * 2);
    x.fillStyle = "#000"; x.fillRect(0, 0, w, h); x.strokeStyle = "rgba(255,255,255,.12)"; x.lineWidth = 1;
    for (let i = 0; i < w; i += 24) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    const k = RM() ? 0.5 : ((now / 4000) % 1), e = k < 0.35 ? k / 0.35 : 2, px_ = -w * 0.4 + e * w * 1.8;
    const g = x.createLinearGradient(px_ - w * 0.25, 0, px_ + w * 0.25, h); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, "rgba(255,255,255,.22)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, w, h); };
  requestAnimationFrame(fr); })();

/* frame timing probe (for perf report) */
let lastF = performance.now(); const probe = (t) => { window.__frames.push(t - lastF); lastF = t; requestAnimationFrame(probe); }; requestAnimationFrame(probe);
})();
