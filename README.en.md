# AI-Native UI Skills

[简体中文](README.md) · **English**

> A **collection of AI-native UI skills for Codex**, focused on a **black-and-white aesthetic**: monochrome tokens, spring motion, Chinese typography and AI-specific components. Each skill ships with a demo and self-check scripts.

<p align="center">
  <img src="skills/anui/docs/media/hero.gif" alt="ANUI demo (OLED theme)" width="720">
</p>

**Live site**: https://yamyyyyy.github.io/ai-native-ui-skill/ (available once deployed)

## Skills

| Skill | Description | Demo | Install (user level) |
|---|---|---|---|
| [ANUI](skills/anui/README.en.md) | OLED / HC monochrome tokens + 8 spring presets + Chinese typography + 21 AI-native components + Playwright self-checks | [Demo](https://yamyyyyy.github.io/ai-native-ui-skill/skills/anui/demo/?lang=en) | `npx degit yamyyyyy/ai-native-ui-skill/skills/anui ~/.agents/skills/anui` |

## Install a single skill into Codex

Codex reads skills from `~/.agents/skills/<name>/` (user level) or `.agents/skills/<name>/` inside a project (project level). The folder name must match `name` in the `SKILL.md` frontmatter.

```bash
# Option 1: degit (downloads just that folder, no git history)
npx degit yamyyyyy/ai-native-ui-skill/skills/anui ~/.agents/skills/anui     # user level
npx degit yamyyyyy/ai-native-ui-skill/skills/anui .agents/skills/anui       # project level

# Option 2: git sparse checkout (easy to update later with git pull)
git clone --depth 1 --filter=blob:none --sparse https://github.com/yamyyyyy/ai-native-ui-skill /tmp/ai-native-ui-skill
git -C /tmp/ai-native-ui-skill sparse-checkout set skills/anui
cp -R /tmp/ai-native-ui-skill/skills/anui ~/.agents/skills/anui
```

Then follow the skill's README and paste its `AGENTS.md` snippet (e.g. [`skills/anui/AGENTS.md`](skills/anui/AGENTS.md)) into the `AGENTS.md` at your project root.

## Repository layout

```text
skills/
  anui/                  ANUI skill (SKILL.md, AGENTS.md, references/, demo/, scripts/, docs/media/)
site/index.html          GitHub Pages home (skills index)
scripts/build-site.mjs   assembles the Pages site → _site/ (home + skills/<name>/demo/)
.github/workflows/       CI: deploys Pages after npm run check passes
LICENSE  NOTICE  THIRD_PARTY_LICENSES.md  CONTRIBUTING.md  CHANGELOG.md
```

## Development and self-checks

```bash
npm install
npm run browsers      # or set CHROME_PATH
npm run check         # ANUI: 6 themes + 2 English runs
npm run build:site    # assemble the Pages site locally into _site/
```

## Adding a skill

Future UI skills are added as siblings under `skills/<name>/`, each with a `SKILL.md` with frontmatter, bilingual READMEs and a check script, and listed in the table above. See [CONTRIBUTING.md](CONTRIBUTING.md#新增-ui-skill--adding-a-new-ui-skill).

## Licence

[MIT](LICENSE). Third-party assets are listed in [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md) and [`NOTICE`](NOTICE).
