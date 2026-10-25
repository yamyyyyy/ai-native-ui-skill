# Third-party licenses / 第三方许可

## 1. beautiful-ui — MIT

- 来源：https://github.com/slev12397/beautiful-ui （站点 https://beautifului.dev），参考版本 `44a274e`
- 用途：**灵感来源**。`references/components.md` 中的组件解剖与尺寸、`references/tokens.md` 附录 A 的对照数值读自其源码；本仓库**未分发**其源码、图片或示例内容，demo 的示例数据与视觉均为原创。

```text
MIT License

Copyright (c) 2026 Shane Levine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 2. desktop-agent-ui — MIT

- 来源：https://github.com/Ludi-Herry/desktop-agent-ui
- 用途：`scripts/clip-audit.js` **原样复制**（文件头保留出处）；`references/craft-rules.md` 与 `references/acceptance.md` 的工艺规则（IME 守卫、阴影裁切余量、字号上限、状态真实性等）基于其规则改写。

```text
MIT License

Copyright (c) 2026 Desktop Agent UI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 3. 字体 — SIL Open Font License 1.1

| 文件 | 原字体 | 版权 | 保留字体名（RFN） | 处理 |
|---|---|---|---|---|
| `demo/assets/fonts/geist.woff2` | Geist | © 2024 The Geist Project Authors | 无 | 子集化（pyftsubset），保留原名 Geist |
| `demo/assets/fonts/geist-mono.woff2` | Geist Mono | © 2024 The Geist Project Authors | 无 | 子集化，保留原名 Geist Mono |
| `demo/assets/fonts/anui-sans-sc.woff2` | Noto Sans SC | © 2014-2021 Adobe | “Source” | 子集化属于 OFL 定义的 Modified Version；为避免与上游名称混淆，内部名称改为 **ANUI Sans SC**（不含保留名 “Source”） |

许可全文与字体放在一起：`demo/assets/fonts/OFL-Geist.txt`、`OFL-GeistMono.txt`、`OFL-NotoSansSC.txt`。字体不得单独出售；随本仓库分发时须保留上述许可文件。
