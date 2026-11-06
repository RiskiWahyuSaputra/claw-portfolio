#!/usr/bin/env python3
"""One-off: converts the heavy PNG sources of the old portfolio into small WebP files."""
from pathlib import Path
from PIL import Image

SRC = Path(__file__).resolve().parents[2] / "porto/portofolio/public"
OUT = Path(__file__).resolve().parents[1] / "public"

PROJECTS = {
    "project-14.png": "warehouse-monitoring", "project-07.png": "smart-resource",
    "project-01.png": "stockflow", "project-08.png": "tokoq", "project-09.png": "klinikq",
    "project-06.png": "faste-coffee", "project-13.png": "undangan", "project-12.png": "qbox",
    "project-11.png": "landing-home", "project-04.png": "qris-praktikum", "project-10.png": "anemia",
    "project-02.png": "school",
}
INTERNAL = {
    "cso.png": "best-cso", "arsip.png": "best-arsip", "finance.png": "best-finance",
    "warehouse.png": "best-warehouse", "sekretariat.png": "sekretariat", "dkp.png": "dkp",
    "chat.png": "livechat",
}


def save(src: Path, dst: Path, width: int, quality: int = 78) -> None:
    im = Image.open(src).convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=quality, method=6)


for name, slug in PROJECTS.items():
    save(SRC / "projects" / name, OUT / "projects" / f"{slug}.webp", 1280)
for name, slug in INTERNAL.items():
    save(SRC / "images" / name, OUT / "projects" / f"{slug}.webp", 1280)
for cert in sorted((SRC / "certificates").glob("cert-*.png")):
    save(cert, OUT / "certificates" / f"{cert.stem}.webp", 1100, 80)
