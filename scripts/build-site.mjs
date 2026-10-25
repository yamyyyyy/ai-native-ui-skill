#!/usr/bin/env node
// Assemble the GitHub Pages site into _site/:
//   _site/index.html              ← site/index.html (skills index)
//   _site/skills/<name>/demo/     ← skills/<name>/demo/ (every skill that has a demo)
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, process.env.SITE_DIR || '_site');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(path.join(ROOT, 'site'), OUT, { recursive: true });
for (const name of readdirSync(path.join(ROOT, 'skills'))) {
  const demo = path.join(ROOT, 'skills', name, 'demo');
  if (!existsSync(demo)) continue;
  cpSync(demo, path.join(OUT, 'skills', name, 'demo'), { recursive: true, filter: (p) => !p.includes(`${path.sep}src`) });
  console.log(`✓ skills/${name}/demo`);
}
console.log(`site → ${path.relative(ROOT, OUT)}/`);
