#!/usr/bin/env python3
"""Generate 81x81 tabBar icons for miniprogram (DESIGN.md: assets/tab/, ink-mute normal, coral active)."""
from PIL import Image, ImageDraw
import os

OUT = '/Users/carlxu/github/family-os/miniprogram/assets/tab'
os.makedirs(OUT, exist_ok=True)

S = 8          # supersample factor
SZ = 81 * S    # 648
INK_MUTE = (140, 124, 102, 255)   # #8C7C66
CORAL = (229, 107, 90, 255)       # #E56B5A

def canvas():
    img = Image.new('RGBA', (SZ, SZ), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)

def px(v):  # design coords on 81 grid -> supersampled
    return v * S

def rr(d, box, r, fill):
    d.rounded_rectangle([px(box[0]), px(box[1]), px(box[2]), px(box[3])], radius=px(r), fill=fill)

def ell(d, box, fill):
    d.ellipse([px(box[0]), px(box[1]), px(box[2]), px(box[3])], fill=fill)

def poly(d, pts, fill):
    d.polygon([(px(x), px(y)) for x, y in pts], fill=fill)

def punch(img, shapes):
    """shapes: list of ('ell'|'rr', box[, r]) to erase (alpha 0)."""
    mask = Image.new('L', (SZ, SZ), 0)
    md = ImageDraw.Draw(mask)
    for s in shapes:
        if s[0] == 'ell':
            md.ellipse([px(v) for v in s[1]], fill=255)
        else:
            md.rounded_rectangle([px(v) for v in s[1]], radius=px(s[2]), fill=255)
    img.putalpha(Image.composite(Image.new('L', (SZ, SZ), 0), img.getchannel('A'), mask))

def icon_home(color):
    img, d = canvas()
    # roof
    poly(d, [(40.5, 8), (74, 38), (66, 46), (40.5, 23), (15, 46), (7, 38)], color)
    # body
    rr(d, (17, 36, 64, 74), 5, color)
    # door punch
    punch(img, [('rr', (33, 50, 48, 74), 4)])
    return img

def icon_role(color):
    img, d = canvas()
    # back person (smaller, right)
    ell(d, (46, 16, 70, 40), color)
    ell(d, (38, 42, 78, 88), color)
    # front person silhouette with outline gap: punch a halo then draw front
    punch(img, [('ell', (6, 8, 52, 54)), ('ell', (-4, 44, 62, 108))])
    ell(d, (11, 13, 47, 49), color)
    ell(d, (1, 49, 57, 103), color)
    # crop bottom to icon area
    punch(img, [('rr', (-10, 74, 91, 120), 0)])
    return img

def icon_toolbox(color):
    img, d = canvas()
    # handle
    rr(d, (28, 8, 53, 26), 6, color)
    punch(img, [('rr', (34, 14, 47, 26), 3)])
    # case
    rr(d, (8, 22, 73, 68), 7, color)
    # middle seam punch + latch
    punch(img, [('rr', (8, 40, 73, 45), 0)])
    rr(d, (34, 36, 47, 49), 3, color)
    return img

def icon_mine(color):
    img, d = canvas()
    ell(d, (24, 8, 57, 41), color)
    ell(d, (12, 46, 69, 104), color)
    punch(img, [('rr', (-10, 74, 91, 120), 0)])
    return img

ICONS = {'home': icon_home, 'role': icon_role, 'toolbox': icon_toolbox, 'mine': icon_mine}

for name, fn in ICONS.items():
    for suffix, color in (('', INK_MUTE), ('-active', CORAL)):
        img = fn(color)
        img = img.resize((81, 81), Image.LANCZOS)
        p = os.path.join(OUT, name + suffix + '.png')
        img.save(p)
        print(p, os.path.getsize(p), 'bytes')
