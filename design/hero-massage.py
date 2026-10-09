"""Build the hero images from Ziad's treatment photo (public/images/massage.jpg).

- removes the "HealthyZone" watermark by re-filling that patch of plain wall
- extends the grey studio wall to make room for the hero text
- grades the photo to a calm, mostly-grey tone

Run from the repo root:  python design/hero-massage.py
Writes public/images/hero-massage-wide.webp (desktop) and hero-massage-square.webp (phones).
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/images/massage.jpg"
OUT = ROOT / "public/images"

rng = np.random.default_rng(7)


def fill_wall(a: np.ndarray, y0: int, y1: int, x0: int, x1: int) -> np.ndarray:
    """Re-fill a rectangle of plain wall by interpolating vertically (the wall is a smooth gradient)."""
    top = a[y0 - 6 : y0, x0:x1].mean(axis=0)
    bot = a[y1 : y1 + 6, x0:x1].mean(axis=0)
    t = np.linspace(0, 1, y1 - y0)[:, None, None]
    fill = top[None] * (1 - t) + bot[None] * t
    fill += rng.normal(0, 1.6, fill.shape)
    out = a.copy()
    # feathered mask so the patch has no hard edges
    mask = np.zeros(a.shape[:2], np.float32)
    mask[y0:y1, x0:x1] = 1
    mask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(6))) / 255
    patch = out.copy()
    patch[y0:y1, x0:x1] = fill
    m = mask[..., None]
    return out * (1 - m) + patch * m


def clean_photo(a: np.ndarray) -> np.ndarray:
    a = fill_wall(a, 80, 225, 60, 680)    # "HealthyZone" watermark
    a = fill_wall(a, 700, 830, 345, 445)  # wall outlet
    return a


def grade(a: np.ndarray, saturation=0.18, tint=(0.985, 1.0, 1.03)) -> np.ndarray:
    """Mostly-grey grade with a faint cool tint and slightly softened contrast."""
    lum = (a * [0.2126, 0.7152, 0.0722]).sum(axis=2, keepdims=True)
    out = lum + (a - lum) * saturation
    out = (out - 128) * 0.95 + 124
    return np.clip(out * tint, 0, 255)


def edge_wall(photo: np.ndarray, width: int, darken=0.62) -> np.ndarray:
    """Extend the photo's left edge into a plain wall that darkens away from the photo."""
    h = photo.shape[0]
    col = photo[:, :24].mean(axis=1)                          # per-row wall colour
    col = np.asarray(Image.fromarray(col[:, None].repeat(4, 1).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)))[:, 0].astype(np.float32)
    # Below the baseboard the edge is floor; stretching it makes streaks, so use one smooth dark tone.
    base = int(h * 0.745)
    floor = col[base + 12 :].mean(axis=0) * 0.72
    ramp = np.clip((np.arange(h) - base) / 12, 0, 1)[:, None]
    col = col * (1 - ramp) + floor * ramp
    col[base + 12 :] *= np.linspace(1.0, 0.8, h - base - 12)[:, None]
    # soften the baseboard into a gentle band so it doesn't read as a bright line behind the text
    col = np.asarray(Image.fromarray(col[:, None].repeat(4, 1).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14)))[:, 0].astype(np.float32)
    ext = np.repeat(col[:, None, :], width, axis=1)
    fade = np.linspace(darken, 1.0, width) ** 1.4             # darker towards the far edge
    ext *= fade[None, :, None]
    ext += rng.normal(0, 2.0, ext.shape)                       # match the photo's grain
    return ext


def blend_seam(left: np.ndarray, right: np.ndarray, feather: int) -> np.ndarray:
    """Join two images side by side, cross-fading `feather` px of the photo into the wall."""
    w = np.linspace(0, 1, feather) ** 1.5
    seam = left[:, -1:] * (1 - w[None, :, None]) + right[:, :feather] * w[None, :, None]
    return np.concatenate([left, seam, right[:, feather:]], axis=1)


def save(a: np.ndarray, name: str):
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(OUT / name, quality=86, method=6)
    print("wrote", name, Image.open(OUT / name).size)


src = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float32)
clean = grade(clean_photo(src))

# Wide (desktop): photo 1200x1200 on the right, wall extended to 2400 wide on the left.
photo = np.asarray(Image.fromarray(clean.astype(np.uint8)).resize((1200, 1200), Image.LANCZOS)).astype(np.float32)
wall = edge_wall(photo, 1200)
save(blend_seam(wall, photo, 160), "hero-massage-wide.webp")

# Square (phones): the cleaned, graded photo on its own; the page fades its bottom into the hero.
save(photo, "hero-massage-square.webp")
