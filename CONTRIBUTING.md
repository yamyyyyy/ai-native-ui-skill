# 贡献指南 / Contributing

以下 1–7 条以 ANUI（`skills/anui/`）为例；所有命令在仓库根目录运行。 / Items 1–7 use ANUI (`skills/anui/`) as the example; run every command from the repo root.

1. `npm install && npm run browsers`（已有 Chrome/Chromium 时可设 `CHROME_PATH` 跳过下载）。 / Set `CHROME_PATH` to skip the download if you already have Chrome/Chromium.
2. 修改 `skills/anui/demo/src/app.css` 后运行 `npm run build:css`。 / Run `npm run build:css` after editing `skills/anui/demo/src/app.css`.
3. 提交前运行 `npm run check`，必须全绿；动效相关改动附上 `npm run perf` 结果。 / `npm run check` must pass before you submit; attach `npm run perf` output for motion changes.
4. 参考文档以简体中文为准，代码与令牌名用英文。没有出处或测量依据的结论标注 **未验证**，有依据的写明来源（`skills/anui/references/sources.md`）或验证方式。 / Simplified Chinese references are canonical; code and token names are English. Mark claims without a source or measurement as **unverified (未验证)**, and cite a source or verification method for the rest.
5. **保持英文同步 / Keep English in sync**：改动 `skills/anui/references/*.md` 时同步更新 `skills/anui/references/en/` 中对应文件（标题一一对应）；改动任一 `README.md` 时同步同目录的 `README.en.md`；demo 新增或修改中文文案时在 `skills/anui/demo/i18n-en.js` 补上英文，否则 `npm run check` 的英文运行会报 `untranslated`。 / When you change `skills/anui/references/*.md`, update the matching file in `skills/anui/references/en/` (headings map one-to-one). Keep each `README.md` and its sibling `README.en.md` in step. When you add or change demo text, add the English to `skills/anui/demo/i18n-en.js`, or the English run of `npm run check` reports `untranslated`.
6. 不要提交第三方源码、图片或示例内容；新增第三方素材须在 `THIRD_PARTY_LICENSES.md` 登记许可。 / Don't commit third-party source, images or sample content; register any new third-party asset's licence in `THIRD_PARTY_LICENSES.md`.
7. 新增字号、颜色或圆角前先看 `skills/anui/references/tokens.md`：字号仅 12 / 13 / 14 / 20，色相仅功能红。 / Check `skills/anui/references/tokens.md` before adding sizes, colours or radii: font sizes are 12 / 13 / 14 / 20 only, and the only hue is a functional red.

## 新增 UI Skill / Adding a new UI skill

1. **目录约定 / Folder**：`skills/<name>/`，`<name>` 用小写短横线，并与 `SKILL.md` 的 `name` 一致（用户安装到 `~/.agents/skills/<name>`）。Skill 运行所需的一切都放在该目录内，不要引用仓库根目录的文件（单独 degit 时根目录不存在）。 / Use `skills/<name>/` in lowercase kebab-case, matching `name` in `SKILL.md` (users install it to `~/.agents/skills/<name>`). Keep everything the skill needs inside that folder and don't depend on root files, which are absent after a single-folder degit.
2. **SKILL.md frontmatter（必填 / required）**：
   ```yaml
   ---
   name: <name>            # 与目录名一致 / matches the folder name
   description: <一句话说明何时使用 / one line on when to use it>
   ---
   ```
3. **自检脚本 / Check script**：提供 `skills/<name>/scripts/check.mjs`（或等价脚本），在根 `package.json` 增加 `check:<name>`，并把它串进 `check`；有 demo 的放在 `skills/<name>/demo/`，`scripts/build-site.mjs` 会自动发布到 Pages 的 `/skills/<name>/demo/`，资源一律用相对路径。 / Ship `skills/<name>/scripts/check.mjs` (or equivalent), add `check:<name>` to the root `package.json` and chain it into `check`. Put any demo in `skills/<name>/demo/`; `scripts/build-site.mjs` publishes it to `/skills/<name>/demo/` on Pages, so use relative asset paths only.
4. **双语文档 / Bilingual docs**：`skills/<name>/README.md`（中文）与 `README.en.md`（英文）顶部互链；在根 `README.md`、`README.en.md` 的 Skill 表和 `site/index.html` 登记；`CHANGELOG.md` 记一条。 / Add cross-linked `skills/<name>/README.md` (Chinese) and `README.en.md` (English); list the skill in the tables of both root READMEs and in `site/index.html`; add a `CHANGELOG.md` entry.
5. 第三方素材登记到根 `THIRD_PARTY_LICENSES.md`。 / Register third-party assets in the root `THIRD_PARTY_LICENSES.md`.
