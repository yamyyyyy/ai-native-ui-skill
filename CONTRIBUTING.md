# 贡献指南

1. `npm install && npm run browsers`（已有 Chrome/Chromium 时可设 `CHROME_PATH` 跳过下载）。
2. 修改 `demo/src/app.css` 后运行 `npm run build:css`。
3. 提交前运行 `npm run check`，必须全绿；动效相关改动附上 `npm run perf` 结果。
4. 文档用简体中文，代码与令牌名用英文。没有出处或测量依据的结论标注 **未验证**，有依据的写明来源（`references/sources.md`）或验证方式。
5. 不要提交第三方源码、图片或示例内容；新增第三方素材须在 `THIRD_PARTY_LICENSES.md` 登记许可。
6. 新增字号、颜色或圆角前先看 `references/tokens.md`：字号仅 12 / 13 / 14 / 20，色相仅功能红。
