#!/usr/bin/env python3
"""Generate 大橙小原 brand logo PNGs for the miniprogram.

Outputs (miniprogram/assets/):
  logo.png      — horizontal lockup: 橙 mascot + 原 sprout + wordmark (for UI headers)
  logo-mark.png — square mascot only (for small icon spots)

Colors mirror styles.css tokens. Run: python scripts/gen-logo.py
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT = '/Users/carlxu/github/family-os/miniprogram/assets'
os.makedirs(OUT, exist_ok=True)

CORAL = (229, 107, 90, 255)      # #E56B5A 大橙
YELLOW = (244, 193, 62, 255)     # #F4C13E 小原
GREEN = (111, 168, 109, 255)     # #6FA86D 叶
INK = (43, 36, 25, 255)          # #2B2419
PAPER = (255, 253, 246, 255)     # #FFFDF6
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'

S = 4  # supersample


def mascot(d, cx, cy, r):
    """大橙(coral) with leaf + face, 小原(yellow sprout) tucked lower-right."""
    # 小原 first (behind)
    yr = int(r * 0.52)
    yx, yy = cx + int(r * 0.72), cy + int(r * 0.55)
    d.ellipse([yx - yr, yy - yr, yx + yr, yy + yr], fill=YELLOW)
    # sprout leaf on 小原
    d.ellipse([yx + int(yr * 0.1), yy - yr - int(yr * 0.5), yx + int(yr * 0.9), yy - yr + int(yr * 0.3)], fill=GREEN)
    # tiny face 小原
    d.ellipse([yx - int(yr * 0.35) - 3 * S, yy - 3 * S, yx - int(yr * 0.35) + 3 * S, yy + 3 * S], fill=INK)
    d.ellipse([yx + int(yr * 0.35) - 3 * S, yy - 3 * S, yx + int(yr * 0.35) + 3 * S, yy + 3 * S], fill=INK)
    # 大橙 body
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CORAL)
    # leaf on top of 橙
    lw = int(r * 0.5)
    d.ellipse([cx - int(lw * 0.2), cy - r - int(lw * 0.9), cx + int(lw * 1.1), cy - r + int(lw * 0.3)], fill=GREEN)
    # stem
    d.line([cx, cy - r + 2 * S, cx, cy - r - int(lw * 0.5)], fill=GREEN, width=3 * S)
    # face 大橙
    ex = int(r * 0.34)
    ey = int(r * 0.10)
    er = int(r * 0.13)
    d.ellipse([cx - ex - er, cy - ey - er, cx - ex + er, cy - ey + er], fill=PAPER)
    d.ellipse([cx + ex - er, cy - ey - er, cx + ex + er, cy - ey + er], fill=PAPER)
    d.ellipse([cx - ex - er // 2, cy - ey - er // 2, cx - ex + er // 2, cy - ey + er // 2], fill=INK)
    d.ellipse([cx + ex - er // 2, cy - ey - er // 2, cx + ex + er // 2, cy - ey + er // 2], fill=INK)
    # smile
    d.arc([cx - int(r * 0.3), cy + int(r * 0.02), cx + int(r * 0.3), cy + int(r * 0.42)],
          start=15, end=165, fill=INK, width=3 * S)


def load_font(px):
    try:
        return ImageFont.truetype(FONT, px, index=0)
    except Exception:
        return ImageFont.load_default()


# — square mark —
MK = 120 * S
mimg = Image.new('RGBA', (MK, MK), (0, 0, 0, 0))
md = ImageDraw.Draw(mimg)
mascot(md, int(MK * 0.44), int(MK * 0.5), int(MK * 0.30))
mimg = mimg.resize((120, 120), Image.LANCZOS)
mimg.save(os.path.join(OUT, 'logo-mark.png'))
print('logo-mark.png', os.path.getsize(os.path.join(OUT, 'logo-mark.png')))

# — horizontal lockup —
LW, LH = 600 * S, 200 * S
limg = Image.new('RGBA', (LW, LH), (0, 0, 0, 0))
ld = ImageDraw.Draw(limg)
mascot(ld, int(LH * 0.52), int(LH * 0.5), int(LH * 0.32))
font = load_font(78 * S)
tx = int(LH * 1.05)
ty = int(LH * 0.5)
word = '大橙小原'
bbox = ld.textbbox((0, 0), word, font=font)
th = bbox[3] - bbox[1]
ld.text((tx, ty - th // 2 - bbox[1]), word, font=font, fill=INK)
sub_font = load_font(26 * S)
ld.text((tx, ty + th // 2 + 6 * S), '好的家庭教育', font=sub_font, fill=CORAL)
limg = limg.resize((600, 200), Image.LANCZOS)
limg.save(os.path.join(OUT, 'logo.png'))
print('logo.png', os.path.getsize(os.path.join(OUT, 'logo.png')))
