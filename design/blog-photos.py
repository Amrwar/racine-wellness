"""Convert the blog photos (supplied by HealthyZone) into web-sized WebP files.

Usage, from the repo root:
  python design/blog-photos.py "C:/Users/hefny/Downloads"
The first argument is the folder that contains the "archive" and "archive (1)" folders.
Writes public/images/blog/*.webp and prints each file's size for src/lib/blog.ts.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / "public/images/blog"
OUT.mkdir(parents=True, exist_ok=True)

def remove_logo(im: Image.Image) -> Image.Image:
    """Find the bright blue/green "HealthyZone" watermark in the top quarter and re-fill it with wall.

    The logo letters are far more saturated than the studio walls, so they are easy to isolate.
    The patch is filled by interpolating each column between the wall just above and below it.
    """
    a = np.asarray(im, np.float32)
    h, w = a.shape[:2]
    top = a[: h // 4]
    hsv = np.asarray(Image.fromarray(top.astype(np.uint8)).convert("HSV"), np.float32)
    hue, sat, val = hsv[..., 0] * 360 / 255, hsv[..., 1] / 255, hsv[..., 2] / 255
    logo = (sat > 0.45) & (val > 0.45) & (((hue > 190) & (hue < 230)) | ((hue > 110) & (hue < 170)))
    ys, xs = np.nonzero(logo)
    if len(xs) < 200:
        return im
    pad = 14
    y0, y1 = max(int(np.percentile(ys, 0.5)) - pad, 1), int(np.percentile(ys, 99.5)) + pad
    x0, x1 = max(int(np.percentile(xs, 0.5)) - pad, 0), min(int(np.percentile(xs, 99.5)) + pad, w)
    above = a[max(y0 - 5, 0) : y0, x0:x1].mean(axis=0)
    below = a[y1 : y1 + 5, x0:x1].mean(axis=0)
    t = np.linspace(0, 1, y1 - y0)[:, None, None]
    patch = a.copy()
    rng = np.random.default_rng(3)
    patch[y0:y1, x0:x1] = above[None] * (1 - t) + below[None] * t + rng.normal(0, 1.5, (y1 - y0, x1 - x0, 3))
    mask = np.zeros((h, w), np.uint8)
    mask[y0:y1, x0:x1] = 255
    m = np.asarray(Image.fromarray(mask).filter(ImageFilter.GaussianBlur(5)), np.float32)[..., None] / 255
    return Image.fromarray(np.clip(a * (1 - m) + patch * m, 0, 255).astype(np.uint8))


# output name -> (source file, max long edge, optional crop box as fractions l,t,r,b)
PHOTOS = {
    "deep-tissue": ("archive/DeepMessage1.jpg", 1600, None),
    "swedish": ("archive/Sweedishmessage.jpg", 1400, None),
    "sports-massage": ("archive/DeepTissueSportMessage.jpg", 1600, None),
    "anatomy-sketch": ("archive (1)/anatomy-sketch-human-body-muscles-front-back-side-views_1346134-13888.jpg", 1400, None),
    "anatomy-study": ("archive (1)/Untitled design (21).jpg", 1200, None),
    "posture-chain": ("archive (1)/0472d2-ac.webp", 900, None),
    "foot-imbalance": ("archive (1)/Untitled design.png", 1200, None),
    "shoulder-rom": ("archive (1)/Untitled design (28).jpg", 1200, None),
    "studio-table": ("archive/messagetable.jpg", 1600, None),
    "studio-table-side": ("archive/Untitled design (5) copy.jpg", 1400, None),
    "ziad-studio": ("archive/Screenshot 2026-09-25 at 1.48.46 PM.png", 1400, None),
    "upper-back": ("archive/Untitled design (4).jpg", 1600, None),
}

# Photos carry a "HealthyZone" watermark; the diagrams keep theirs as part of the design.
DIAGRAMS = {"anatomy-sketch", "anatomy-study", "posture-chain", "foot-imbalance", "shoulder-rom"}

for name, (rel, edge, crop) in PHOTOS.items():
    im = Image.open(SRC / rel).convert("RGB")
    if crop:
        w, h = im.size
        im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    if name not in DIAGRAMS:
        im = remove_logo(im)
    im.thumbnail((edge, edge), Image.LANCZOS)
    path = OUT / f"{name}.webp"
    im.save(path, quality=82, method=6)
    print(f'{name:18} {im.size[0]}x{im.size[1]}  {round(path.stat().st_size / 1024)} KB')
