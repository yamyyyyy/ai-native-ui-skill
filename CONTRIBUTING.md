# 贡献指南 / Contributing

1. `npm install && npm run browsers`（已有 Chrome/Chromium 时可设 `CHROME_PATH` 跳过下载）。 / Set `CHROME_PATH` to skip the download if you already have Chrome/Chromium.
2. 修改 `demo/src/app.css` 后运行 `npm run build:css`。 / Run `npm run build:css` after editing `demo/src/app.css`.
3. 提交前运行 `npm run check`，必须全绿；动效相关改动附上 `npm run perf` 结果。 / `npm run check` must pass before you submit; attach `npm run perf` output for motion changes.
4. 参考文档以简体中文为准，代码与令牌名用英文。没有出处或测量依据的结论标注 **未验证**，有依据的写明来源（`references/sources.md`）或验证方式。 / Simplified Chinese references are canonical; code and token names are English. Mark claims without a source or measurement as **unverified (未验证)**, and cite a source or verification method for the rest.
5. **保持英文同步 / Keep English in sync**：改动 `references/*.md` 时同步更新 `references/en/` 中对应文件（标题一一对应）；改动 `README.md` 时同步 `README.en.md`；demo 新增或修改中文文案时在 `demo/i18n-en.js` 补上英文，否则 `npm run check` 的英文运行会报 `untranslated`。 / When you change `references/*.md`, update the matching file in `references/en/` (headings map one-to-one). Keep `README.md` and `README.en.md` in step. When you add or change demo text, add the English to `demo/i18n-en.js`, or the English run of `npm run check` reports `untranslated`.
6. 不要提交第三方源码、图片或示例内容；新增第三方素材须在 `THIRD_PARTY_LICENSES.md` 登记许可。 / Don't commit third-party source, images or sample content; register any new third-party asset's licence in `THIRD_PARTY_LICENSES.md`.
7. 新增字号、颜色或圆角前先看 `references/tokens.md`：字号仅 12 / 13 / 14 / 20，色相仅功能红。 / Check `references/tokens.md` before adding sizes, colours or radii: font sizes are 12 / 13 / 14 / 20 only, and the only hue is a functional red.
