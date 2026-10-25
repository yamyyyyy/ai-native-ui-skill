#!/usr/bin/env python3
"""APCA (W3 0.0.98G-4g) + WCAG 2.x contrast for OKLCH token pairs.
Usage: contrast.py tokens.json > contrast.md   (tokens.json = {theme: {name: "oklch(L C H[ / a])"}})"""
import json, math, re, sys
def parse(s):
    m = re.match(r"oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*/\s*([\d.]+))?\)", s)
    if not m: raise ValueError(s)
    return [float(x) for x in m.groups()[:3]] + [float(m.group(4) or 1)]
def to_srgb(L, C, H):
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l = (L + .3963377774*a + .2158037573*b) ** 3; m = (L - .1055613458*a - .0638541728*b) ** 3; s = (L - .0894841775*a - 1.2914855480*b) ** 3
    lin = [4.0767416621*l - 3.3077115913*m + .2309699292*s, -1.2684380046*l + 2.6097574011*m - .3413193965*s, -.0041960863*l - .7034186147*m + 1.7076147010*s]
    enc = lambda c: 12.92*c if c <= .0031308 else 1.055*c**(1/2.4) - .055
    return [min(1, max(0, enc(min(1, max(0, c))))) for c in lin]
def color(s, over=None):
    L, C, H, A = parse(s); rgb = to_srgb(L, C, H)
    if A < 1 and over: rgb = [A*c + (1-A)*o for c, o in zip(rgb, over)]
    return rgb
def wcag(fg, bg):
    lin = lambda c: c/12.92 if c <= .04045 else ((c+.055)/1.055) ** 2.4
    Y = lambda r: .2126*lin(r[0]) + .7152*lin(r[1]) + .0722*lin(r[2])
    a, b = sorted([Y(fg), Y(bg)], reverse=True); return (a + .05) / (b + .05)
def apca(fg, bg):
    Y = lambda r: .2126729*r[0]**2.4 + .7151522*r[1]**2.4 + .0721750*r[2]**2.4
    clamp = lambda y: y + (.022 - y) ** 1.414 if y < .022 else y
    t, b = clamp(Y(fg)), clamp(Y(bg))
    if abs(b - t) < .0005: return 0.0
    if b > t: s = (b**.56 - t**.57) * 1.14; return 0.0 if s < .1 else (s - .027) * 100
    s = (b**.65 - t**.62) * 1.14; return 0.0 if s > -.1 else (s + .027) * 100
# (text token, [backgrounds], role, APCA |Lc| target, WCAG target)
PAIRS = [
 ("ink", ["page","surface","overlay","hover","field"], "正文 / 标题 14px", 90, 7.0),
 ("ink-2", ["page","surface","overlay","hover"], "次级正文 13–14px", 60, 4.5),
 ("ink-3", ["page","surface","field"], "元信息 12–13px（分级未验证）", 45, 3.0),
 ("ink-4", ["surface"], "占位 / 禁用", 30, 1.5),
 ("red", ["page","surface","red-tint"], "危险 / 错误文字", 60, 4.5),
 ("on-accent", ["accent"], "反色主按钮文字", 75, 4.5),
 ("tooltip-fg", ["tooltip-bg"], "Tooltip 文字", 75, 4.5),
 ("tooltip-muted", ["tooltip-bg"], "Tooltip 次级", 45, 3.0),
]
def main(path):
    T = json.load(open(path)); out = ["# 对比度报告（APCA Lc + WCAG 2）", "",
      "算法：APCA-W3 0.0.98G-4g；WCAG 2.x 相对亮度。带透明度的背景（如 `red-tint`）先合成到 `page` 上再计算。",
      "目标：APCA Bronze 档 —— 正文 Lc 90（最低 75）、可读内容 Lc 60、大字/图标 45、占位/禁用 30。深色模式 Lc 为负值，比较绝对值。", ""]
    fails = 0
    for th, tok in T.items():
        page = color(tok["page"])
        out += [f"## {th}", "", "| 文字 | 背景 | 用途 | APCA Lc | 目标 | WCAG | 目标 | 结果 |", "|---|---|---|---|---|---|---|---|"]
        for fg, bgs, role, la, wa in PAIRS:
            for bgn in bgs:
                bg = color(tok[bgn], page); f = color(tok[fg], bg)
                lc, cr = apca(f, bg), wcag(f, bg); ok = abs(lc) >= la and cr >= wa; fails += not ok
                out.append(f"| `{fg}` | `{bgn}` | {role} | {lc:+.1f} | ≥{la} | {cr:.2f} | ≥{wa} | {'✅' if ok else '❌'} |")
        out.append("")
    out.insert(4, f"**汇总：{'全部通过' if not fails else f'{fails} 项未达标'}**\n")
    print("\n".join(out)); return fails
if __name__ == "__main__": sys.exit(1 if main(sys.argv[1]) else 0)
