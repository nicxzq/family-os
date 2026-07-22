#!/usr/bin/env python3
"""Regenerate the compact brand logo GIF from uploads/logo-source.gif.

Source: 1080x1080, 86 frames, ~28 fps, ~2.0 MB
Output: 280x280, 10 fps (100 ms/frame), 32-color shared palette, ~130 KB

Written to both miniprogram/assets/logo.gif (mini program hero) and
logo.gif (website hero, index.html slogan).

Uses ffmpeg palettegen/paletteuse — Pillow's GIF writer produced ~2.4x
larger files for the same visual result. Run: python3 scripts/gen-logo-gif.py
"""
import shutil
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "uploads" / "logo-source.gif"
OUTPUTS = (
    ROOT / "miniprogram" / "assets" / "logo.gif",
    ROOT / "logo.gif",
)

FPS = 10
SIZE = 280
MAX_COLORS = 32  # flat brand art — 32 colors is visually lossless here

FILTER = (
    f"fps={FPS},scale={SIZE}:{SIZE}:flags=lanczos,split[a][b];"
    f"[a]palettegen=max_colors={MAX_COLORS}:stats_mode=diff[p];"
    f"[b][p]paletteuse=dither=bayer:bayer_scale=3"
)


def generate() -> None:
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg not found — install it first (brew install ffmpeg)")
    if not SOURCE.exists():
        raise SystemExit(f"missing source: {SOURCE}")

    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "logo.gif"
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(SOURCE), "-vf", FILTER, str(out)],
            check=True,
        )
        data = out.read_bytes()

    for target in OUTPUTS:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        print(f"{target.relative_to(ROOT)}  {len(data):,} bytes")


if __name__ == "__main__":
    generate()
