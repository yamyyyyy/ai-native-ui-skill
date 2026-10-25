#!/usr/bin/env node
// ANUI frame-timing probe: scripted interaction pass over demo/index.html (theme=oled),
// rAF intervals from window.__frames + Chrome trace counts → reports/perf.json.
// Headless/software-GL numbers are a smoke test, not device performance.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = path.join(ROOT, 'reports'); mkdirSync(REPORTS, { recursive: true });
const TRACE = path.join(os.tmpdir(), 'anui-trace.json');
async function script(p){
  const el=async s=>(await p.$(s)).boundingBox();
  await p.waitForTimeout(800);
  await p.evaluate(()=>document.querySelector('#lab').scrollIntoView());await p.waitForTimeout(400);
  for(const n of ['pop','snap','fling','sheet']){await p.click(`[data-p=${n}]`);await p.waitForTimeout(700);}
  await p.click('#retarget');await p.waitForTimeout(900);
  await p.click('#toastAdd');await p.waitForTimeout(250);await p.click('#toastAdd');await p.waitForTimeout(250);await p.click('#toastAdd');await p.waitForTimeout(500);
  const tb=await el('#toasts');await p.mouse.move(tb.x+tb.width/2,tb.y+tb.height-20);await p.waitForTimeout(700);
  await p.click('#shuffle');await p.waitForTimeout(800);
  await p.evaluate(()=>document.querySelector('#tiles').scrollIntoView({block:'center'}));await p.waitForTimeout(300);
  await p.click('#tiles .m-tile');await p.waitForTimeout(800);await p.click('#tiles .m-tile.open');await p.waitForTimeout(700);
  const pk=await el('#puck');await p.mouse.move(pk.x+24,pk.y+24);await p.mouse.down();
  for(let i=1;i<=12;i++){await p.mouse.move(pk.x+24+i*18,pk.y+24);await p.waitForTimeout(16);} await p.mouse.up();await p.waitForTimeout(1000);
  const sh=await el('#sheet');await p.mouse.move(sh.x+100,sh.y+20);await p.mouse.down();for(let i=1;i<=8;i++){await p.mouse.move(sh.x+100,sh.y+20+i*12);await p.waitForTimeout(16);}await p.mouse.up();await p.waitForTimeout(900);
  await p.evaluate(()=>document.querySelector('#ai').scrollIntoView());await p.waitForTimeout(300);
  await p.click('#run');await p.waitForTimeout(6200);await p.click('[data-a=ok]');await p.waitForTimeout(600);
  await p.evaluate(()=>document.querySelector('#fx').scrollIntoView());const fx=await el('#fxgl');
  for(let i=0;i<30;i++){await p.mouse.move(fx.x+20+i*12,fx.y+40+Math.sin(i/4)*40);await p.waitForTimeout(25);}
  await p.waitForTimeout(800);
  await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(300);await p.click('#themes [data-t=hc]');await p.waitForTimeout(900);await p.click('#themes [data-t=oled]');await p.waitForTimeout(900);
}

const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'] });
const p = await b.newPage({ viewport: { width: 900, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(pathToFileURL(path.join(ROOT, 'demo/index.html')).href + '?theme=oled'); await p.evaluate(() => document.fonts.ready);
await b.startTracing(p, { path: TRACE, categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline.frame', 'benchmark', 'cc'] });
await p.evaluate(() => { window.__frames.length = 0; }); const t0 = Date.now();
await script(p);
const fr = await p.evaluate(() => window.__frames.slice()); await b.stopTracing();
const s = [...fr].sort((a, c) => a - c), med = s[s.length >> 1], q = f => s[Math.floor(s.length * f)];
const tr = JSON.parse(readFileSync(TRACE, 'utf8')); const ev = tr.traceEvents || tr; const counts = {};
ev.forEach(e => { if (/^(DroppedFrame|BeginFrame|DrawFrame)$/.test(e.name)) counts[e.name] = (counts[e.name] || 0) + 1; });
const rep = { date: new Date().toISOString(), env: 'headless chromium, SwiftShader GL', durationS: (Date.now() - t0) / 1000, rafFrames: fr.length,
  medianMs: +med.toFixed(2), p95Ms: +q(.95).toFixed(2), p99Ms: +q(.99).toFixed(2), worstMs: +s[s.length - 1].toFixed(1),
  longFrames_gt1_5x: fr.filter(x => x > med * 1.5).length, missedVsyncs: fr.reduce((a, x) => a + Math.max(0, Math.round(x / med) - 1), 0), trace: counts, errors: errs };
writeFileSync(path.join(REPORTS, 'perf.json'), JSON.stringify(rep, null, 2)); console.log(JSON.stringify(rep, null, 2)); await b.close();
