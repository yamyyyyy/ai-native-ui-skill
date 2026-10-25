#!/usr/bin/env node
// ANUI self-check: loads demo/index.html in every theme with Playwright and verifies
//   1) no JS errors  2) no network requests (file/data/blob only)
//   3) clip-audit cut === 0  4) font sizes ⊂ whitelist  5) token contrast (scripts/contrast.py)
// Usage: npm run check   (env: CHROME_PATH=/path/to/chrome, THEMES=hc,oled, SHOTS=1)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEMO = pathToFileURL(path.join(ROOT, 'demo/index.html')).href;
const REPORTS = path.join(ROOT, 'reports'); mkdirSync(REPORTS, { recursive: true });
const THEMES = (process.env.THEMES || 'hc,oled,oled-hc,paper,white,dark').split(',');
const SIZES = [12, 13, 14, 20];
const TOKENS = ['page','surface','overlay','hover','field','ink','ink-2','ink-3','ink-4','red','red-tint','accent','on-accent','tooltip-bg','tooltip-fg','tooltip-muted'];
const audit = readFileSync(path.join(ROOT, 'scripts/clip-audit.js'), 'utf8').replace(/^\s*\/\/.*$/mg, '').trim().replace(/;\s*$/, '');

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader'],
});
const results = {}, tokens = {}; let failed = 0;
for (const theme of THEMES) {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = [], net = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('request', r => { if (!/^(file|data|blob):/.test(r.url())) net.push(r.url()); });
  await page.goto(`${DEMO}?theme=${theme}`);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
  await page.click('#run').catch(() => {}); await page.waitForTimeout(6500);
  await page.click('#toastAdd').catch(() => {}); await page.waitForTimeout(800);
  const sizes = await page.evaluate(() => { const s = new Set(); document.querySelectorAll('body *').forEach(e => { if ([...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.getClientRects().length) s.add(parseFloat(getComputedStyle(e).fontSize)); }); return [...s].sort((a, b) => a - b); });
  const clip = await page.evaluate(`(${audit})({})`);
  tokens[theme] = await page.evaluate(names => { const p = document.createElement('i'); document.body.append(p); const o = {}; for (const n of names) { p.style.color = `var(--${n})`; o[n] = getComputedStyle(p).color; } p.remove(); return o; }, TOKENS);
  if (process.env.SHOTS) await page.screenshot({ path: path.join(REPORTS, `shot-${theme}.png`) });
  const badSizes = sizes.filter(s => !SIZES.includes(s));
  const ok = !errs.length && !net.length && clip.cut === 0 && !badSizes.length;
  failed += !ok;
  results[theme] = { ok, errors: errs, network: net, cut: clip.cut, issues: (clip.issues || []).slice(0, 5), sizes, badSizes };
  console.log(`${ok ? '✓' : '✗'} ${theme.padEnd(8)} errors=${errs.length} network=${net.length} cut=${clip.cut} sizes=[${sizes}]${badSizes.length ? ' bad=' + badSizes : ''}`);
  await page.close();
}
await browser.close();

// Contrast: computed colours → contrast.py (needs python3). Non-oklch values are reported, not guessed.
writeFileSync(path.join(REPORTS, 'tokens.json'), JSON.stringify(tokens, null, 2));
const py = spawnSync(process.env.PYTHON || 'python3', [path.join(ROOT, 'scripts/contrast.py'), path.join(REPORTS, 'tokens.json')], { encoding: 'utf8' });
let contrast;
if (py.error) { contrast = 'skipped (python3 not found)'; console.log('! contrast skipped: python3 not found'); }
else { writeFileSync(path.join(REPORTS, 'contrast.md'), py.stdout); contrast = py.status === 0 ? 'pass' : 'fail'; if (py.status !== 0) { failed++; console.log(py.stderr.trim() || (py.stdout.match(/\*\*汇总：.*\*\*/) || [''])[0]); } console.log(`${py.status === 0 ? '✓' : '✗'} contrast  → reports/contrast.md`); }
writeFileSync(path.join(REPORTS, 'check.json'), JSON.stringify({ date: new Date().toISOString(), themes: results, contrast }, null, 2));
console.log(failed ? `\n✗ ${failed} check(s) failed` : '\n✓ all checks passed');
process.exit(failed ? 1 : 0);
