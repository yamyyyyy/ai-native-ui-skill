/* ANUI spring solver — vanilla, no deps. Closed-form damped harmonic oscillator (mass m, stiffness k, damping c).
   Apple-style perceptual params: k = (2π/duration)², c = 4π(1−bounce)/duration (bounce ≥ 0; m = 1). */
(function (g) {
  const fromDB = (duration, bounce = 0, mass = 1) => {
    const k = Math.pow((2 * Math.PI) / duration, 2) * mass;
    const c = bounce >= 0 ? (4 * Math.PI * (1 - bounce) * mass) / duration : (4 * Math.PI * mass) / (duration * (1 + bounce));
    return { stiffness: k, damping: c, mass };
  };
  /* position x(t) from 0→1 with initial velocity v0 (units/s, normalised to distance) */
  const solve = ({ stiffness: k, damping: c, mass: m = 1 }, v0 = 0) => {
    const w0 = Math.sqrt(k / m), z = c / (2 * Math.sqrt(k * m)), x0 = -1; // displacement from target
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return (t) => 1 + Math.exp(-z * w0 * t) * (x0 * Math.cos(wd * t) + ((v0 + z * w0 * x0) / wd) * Math.sin(wd * t));
    }
    if (z === 1) return (t) => 1 + Math.exp(-w0 * t) * (x0 + (v0 + w0 * x0) * t);
    const s = w0 * Math.sqrt(z * z - 1), r1 = -z * w0 + s, r2 = -z * w0 - s, B = (v0 - r1 * x0) / (r2 - r1), A = x0 - B;
    return (t) => 1 + A * Math.exp(r1 * t) + B * Math.exp(r2 * t);
  };
  /* settle: first t after which |x−1| < eps forever (sampled) */
  const settle = (p, v0 = 0, eps = 0.001) => { const f = solve(p, v0); let last = 0; for (let t = 0; t < 10; t += 1 / 240) if (Math.abs(f(t) - 1) > eps) last = t; return last; };
  /* CSS linear() approximation, n points + total duration in ms */
  const toLinear = (p, n = 40, v0 = 0) => { const T = settle(p, v0, 0.002), f = solve(p, v0), pts = [];
    for (let i = 0; i <= n; i++) pts.push(+f((T * i) / n).toFixed(4));
    pts[n] = 1; return { duration: Math.round(T * 1000), easing: `linear(${pts.join(", ")})` }; };
  /* stateful animator: interruptible, carries velocity when retargeted */
  function Spring(p, onUpdate) { this.p = p; this.x = 0; this.v = 0; this.to = 0; this.onUpdate = onUpdate; this.raf = 0; }
  Spring.prototype.set = function (to, vel) { this.to = to; if (vel !== undefined) this.v = vel; if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.tick.bind(this)); } };
  Spring.prototype.jump = function (x) { this.x = this.to = x; this.v = 0; this.onUpdate(x); };
  Spring.prototype.tick = function (now) {
    let dt = Math.min(0.064, (now - this.last) / 1000); this.last = now; const { stiffness: k, damping: c, mass: m } = this.p;
    const steps = Math.ceil(dt / (1 / 240)); dt /= steps;
    for (let i = 0; i < steps; i++) { const a = (-k * (this.x - this.to) - c * this.v) / m; this.v += a * dt; this.x += this.v * dt; } // semi-implicit Euler @240Hz
    this.onUpdate(this.x, this.v);
    if (Math.abs(this.v) < 0.01 && Math.abs(this.x - this.to) < 0.01) { this.x = this.to; this.v = 0; this.onUpdate(this.x, 0); this.raf = 0; return; }
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };
  g.ANUISpring = { fromDB, solve, settle, toLinear, Spring };
})(typeof window !== "undefined" ? window : globalThis);
