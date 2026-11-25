"""Regenerate the card banners in the site's flat style (Radix Slate + Indigo, Inter).
Usage: python make_banners.py   (needs Google Chrome + Pillow; writes ../../assets/images/*.jpg)"""
import subprocess, pathlib, tempfile
from PIL import Image

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent.parent / "assets" / "images"
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# Palette = the isekai calendar swatches (isekai-obsidian/src/lib/palette.ts)
BUTTER, MOSS, PALM = "#F4D892", "#C0B05B", "#657652"
GUAVA, SUNSET, SANGRIA = "#F2B6A3", "#E89C73", "#E36559"
SEA, LAGOON, ODYSSEY = "#E5E9EB", "#94BEBB", "#23617E"
INK = "#22302C"
# per banner: background, text colour, strong shape, mid shape, soft shape
# "Winter Cedar" (isekai-obsidian/obsidian/flat.css): one quiet family for every banner
PAPER, PINE, PINE_MID, PINE_SOFT, TAPE = "#E1EAE6", "#2F5D50", "#8FAFA4", "#C9D9D2", "#F6E7B4"
THEMES = {k: (PAPER, INK, PINE, PINE_MID, PINE_SOFT) for k in [
  "teach-appam", "teach-otter", "teach-foundations", "teach-xrp", "teach-wind",
  "res-thelab", "res-wiki", "res-talks", "res-osu", "proj-xrp", "proj-e4usa"]}

def motif(kind, w, h, A, A2, A3, bg):
    A4 = A3
    x0 = w * 0.58
    if kind == "lab":        # many inputs -> one insight
        rows = "".join(f'<rect x="{x0}" y="{40+i*24}" width="{90+(i%3)*30}" height="10" rx="5" fill="{A3}"/>' for i in range(6))
        return rows + f'<circle cx="{w-70}" cy="{h/2}" r="34" fill="{A}"/><circle cx="{w-70}" cy="{h/2}" r="12" fill="{bg}"/>'
    if kind == "multilevel": # groups nested in clusters
        out = ""
        for cx, cy, r in [(x0+50, 82, 46), (x0+140, 132, 50), (x0+190, 58, 34)]:
            out += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{A4}"/>'
            for dx, dy in [(-r*.4, -r*.2), (r*.3, -r*.35), (0, r*.35), (r*.4, r*.2)]:
                out += f'<circle cx="{cx+dx}" cy="{cy+dy}" r="6" fill="{A}"/>'
        return out
    if kind == "bars":
        hs = [60, 95, 130, 80, 150, 115]
        return "".join(f'<rect x="{x0+20+i*34}" y="{h-30-v}" width="22" height="{v}" rx="5" fill="{A if i==4 else A3}"/>' for i, v in enumerate(hs))
    if kind == "robot":
        return (f'<rect x="{x0+40}" y="50" width="150" height="80" rx="18" fill="{A3}"/>'
                f'<circle cx="{x0+85}" cy="90" r="12" fill="{A}"/><circle cx="{x0+145}" cy="90" r="12" fill="{A}"/>'
                f'<circle cx="{x0+70}" cy="150" r="22" fill="{A}"/><circle cx="{x0+160}" cy="150" r="22" fill="{A}"/>'
                f'<circle cx="{x0+70}" cy="150" r="8" fill="{bg}"/><circle cx="{x0+160}" cy="150" r="8" fill="{bg}"/>')
    if kind == "wind":
        cx, cy = x0+130, 95
        blades = "".join(f'<rect x="{cx-7}" y="{cy-78}" width="14" height="78" rx="7" fill="{A}" transform="rotate({a} {cx} {cy})"/>' for a in (0, 120, 240))
        return f'<rect x="{cx-4}" y="{cy}" width="8" height="{h-cy}" fill="{A2}"/>' + blades + f'<circle cx="{cx}" cy="{cy}" r="10" fill="{bg}" stroke="{A}" stroke-width="4"/>'
    if kind == "venn":
        return "".join(f'<circle cx="{x0+30+dx}" cy="{100+dy}" r="56" fill="{c}" fill-opacity=".75"/>' for dx, dy, c in [(0, 0, A4), (70, 0, A3), (35, -45 if False else 0, A2)][:2]) + f'<circle cx="{x0+135}" cy="100" r="56" fill="{A}" fill-opacity=".85"/>'
    if kind == "grid":
        on = {(0,1),(1,3),(2,0),(2,2),(3,1),(3,3),(4,2)}
        return "".join(f'<rect x="{x0+10+c*44}" y="{18+r*44}" width="34" height="34" rx="6" fill="{A if (c,r) in on else A4}"/>' for c in range(5) for r in range(4))
    if kind == "wave":
        hs = [30, 60, 100, 70, 130, 90, 50, 110, 80, 40, 20]
        return "".join(f'<rect x="{x0+i*20}" y="{h/2-v/2}" width="10" height="{v}" rx="5" fill="{A if v>=100 else A3}"/>' for i, v in enumerate(hs))
    if kind == "steps":
        return "".join(f'<rect x="{x0+20+i*48}" y="{h-40-(i+1)*30}" width="48" height="{(i+1)*30}" fill="{A if i==3 else (A3 if i%2 else A4)}"/>' for i in range(4)) + f'<circle cx="{x0+20+3*48+24}" cy="{h-40-4*30-22}" r="12" fill="{A}"/>'
    return ""

BANNERS = [
  ("teach-appam",       "AI Peer Learning Lab", ["APPAM 2026", "Boston, MA"], "Workshop", "lab", None),
  ("teach-otter",       "Multilevel Modeling",  ["OTTER Workshop", "The Ohio State University"], "Workshop", "multilevel", None),
  ("teach-foundations", "EED Foundations",      ["Graduate Course", "Engineering Education"], "Course", "bars", None),
  ("teach-xrp",         "XRP Robotics",         ["Curriculum Design", "e4usa + FIRST"], "Curriculum", "robot", None),
  ("teach-wind",        "Unit 2B: Wind",        ["Engineering is Creative", "e4usa + TeachEngineering"], "Curriculum", "wind", None),
  ("res-thelab",        "THE² Lab",             ["Transformative & Holistic", "Engineering Education"], "Lab", "venn", None),
  ("res-wiki",          "Community Wiki",       ["Engineering Education", "Community Resource"], "Resource", "grid", None),
  ("res-talks",         "Theory Talks",         ["Engineering Education", "Podcast on Spotify"], "Podcast", "wave", None),
  ("res-osu",           "OSU EED PhD",          ["Engineering Education", "PhD Program"], "Program", "steps", None),
  ("proj-xrp",          "Exploring Robotics Pathways", ["e4usa × FIRST · NSF-funded"], "Project", None, ["logo-xrp.png"]),
  ("proj-e4usa",        "Engineering for Us All", ["e4usa · NSF-funded"], "Project", None, ["logo-e4usa.png"]),
]

def html(name, title, subs, tag, kind, logos):
    bg, ink, c1, c2, c3 = THEMES[name]
    big = name.startswith("proj")
    w, h = (840, 300) if big else (560, 200)
    k = 1.5 if big else 1
    sub = "".join(f"<div>{s}</div>" for s in subs)
    right = ""
    if kind:
        right = f'<svg width="{w}" height="{h}" style="position:absolute;inset:0">{motif(kind, w, h, c1, c2, c3, bg)}</svg>'
    if logos:
        imgs = "".join(f'<img src="file://{OUT/l}" style="width:78%;max-height:80%;object-fit:contain">' for l in logos)
        plus = f'<span style="font:700 34px Inter;color:{ink}">+</span>' if len(logos) > 1 else ""
        if plus: imgs = imgs.replace('"><img', f'">{plus}<img', 1)
        right = (f'<div style="position:absolute;right:40px;top:40px;bottom:40px;width:300px;background:#fff;border-radius:12px;'
                 f'display:flex;align-items:center;justify-content:center;gap:14px">{imgs}</div>')
    return f"""<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500&family=Source+Serif+4:opsz,wght@8..60,500&display=swap" rel="stylesheet">
<style>*{{margin:0}}body{{width:{w}px;height:{h}px;overflow:hidden;background:{bg};font-family:Inter,sans-serif;position:relative}}
.t{{position:absolute;left:{32*k}px;top:{34*k}px;z-index:2;max-width:{w*0.52}px}}
.tag{{display:inline-block;font-size:{11*k}px;font-weight:500;color:#1D3D34;background:rgba(255,255,255,.7);border-radius:{4*k}px;padding:{2*k}px {8*k}px;margin-bottom:{12*k}px}}
h1{{font-family:'Source Serif 4',serif;font-size:{27*k}px;font-weight:500;line-height:1.18;color:{ink};margin-bottom:{8*k}px}}
.s{{font-size:{13.5*k}px;font-weight:500;line-height:1.5;color:#55635E}}</style></head>
<body>{right}<div class="t"><span class="tag">{tag}</span><h1>{title}</h1><div class="s">{sub}</div></div></body></html>""", w, h

tmp = pathlib.Path(tempfile.mkdtemp())
for b in BANNERS:
    doc, w, h = html(*b)
    src = tmp / f"{b[0]}.html"; src.write_text(doc)
    png = tmp / f"{b[0]}.png"
    subprocess.run([CHROME, "--headless=new", "--hide-scrollbars", "--force-device-scale-factor=2",
                    f"--window-size={w},{h}", "--virtual-time-budget=10000", "--allow-file-access-from-files",
                    f"--screenshot={png}", f"file://{src}"], check=True, capture_output=True)
    Image.open(png).convert("RGB").save(OUT / f"{b[0]}.jpg", quality=90, optimize=True)
    print("ok", b[0])
