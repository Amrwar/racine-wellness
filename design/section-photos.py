"""Build the section background photos.

Sources (put them in design/photos/ before running):
  training.jpg   HealthyZone Instagram: client squat during a training session   -> services
  community.jpg  HealthyZone Instagram: Ziad with two clients in the gym          -> about
  room.jpg       Unsplash photo-1787651343620-8d5303006ecb (Unsplash License),
                 an empty treatment room                                          -> contact

The Instagram shots carry a "HealthyZone" watermark on plain wall, which is re-filled
from the surrounding wall. All photos get the same soft, slightly desaturated grade so
they sit together with the grey hero; the page adds the colour overlays.

Run from the repo root:  python design/section-photos.py
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design/photos"
OUT = ROOT / "public/images"
rng = np.random.default_rng(11)


def fill_wall(a: np.ndarray, y0: int, y1: int, x0: int, x1: int) -> np.ndarray:
    """Re-fill a rectangle of plain wall by interpolating between the rows above and below it."""
    top = a[max(y0 - 6, 0) : max(y0, 6), x0:x1].mean(axis=0)
    bot = a[y1 : y1 + 6, x0:x1].mean(axis=0)
    t = np.linspace(0, 1, y1 - y0)[:, None, None]
    patch = a.copy()
    patch[y0:y1, x0:x1] = top[None] * (1 - t) + bot[None] * t + rng.normal(0, 1.4, (y1 - y0, x1 - x0, 3))
    mask = np.zeros(a.shape[:2], np.uint8)
    mask[y0:y1, x0:x1] = 255
    m = np.asarray(Image.fromarray(mask).filter(ImageFilter.GaussianBlur(6)), np.float32)[..., None] / 255
    return a * (1 - m) + patch * m


def grade(a: np.ndarray, saturation: float) -> np.ndarray:
    lum = (a * [0.2126, 0.7152, 0.0722]).sum(axis=2, keepdims=True)
    return np.clip(lum + (a - lum) * saturation, 0, 255)


def save(a: np.ndarray, name: str, size: tuple[int, int] | None = None):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(OUT / name, quality=82, method=6)
    print("wrote", name, im.size, round((OUT / name).stat().st_size / 1024), "KB")


def load(name: str) -> np.ndarray:
    return np.asarray(Image.open(SRC / name).convert("RGB"), np.float32)


# Services: training session (1400x1400). Watermark badge top-left.
a = fill_wall(load("training.jpg"), 35, 155, 25, 385)
save(grade(a, 0.45), "section-training.webp", (1400, 1400))

# About: Ziad with clients (1203x1203). Watermark top-right on the wall.
a = fill_wall(load("community.jpg"), 55, 190, 590, 1190)
save(grade(a, 0.5), "section-community.webp", (1203, 1203))

# Contact: empty treatment room (1600x2400 portrait) -> landscape crop around the table and window.
a = load("room.jpg")
a = a[900:1900]  # 1600x1000 band: window, sink and table
save(grade(a, 0.55), "section-room.webp", (1600, 1000))
