#!/usr/bin/env python3
"""
Bundler khusus untuk deploy ke VM di belakang Load Balancer.

MASALAH: Load Balancer Azure kerja per-koneksi TCP (Layer 4), bukan
per-halaman. Kalau index.html, style.css, dan file .js masih request
terpisah, browser bisa "dilempar" ke VM lain di tengah proses loading
satu halaman — padahal tiap VM isinya portofolio ORANG YANG BEDA. Itu
sebabnya CSS/JS suka nggak keload pas di-refresh.

SOLUSI: gabungkan semua CSS + JS jadi inline di DALAM satu file HTML.
Jadi cuma ada 1 request/koneksi per kunjungan — nggak ada celah lagi
buat ke-split ke VM lain.

Source code (index.html, css/, js/) TIDAK diubah sama sekali — script
ini cuma MEMBACA source itu dan nulis hasil gabungannya ke folder
dist/. Jadi kamu tetap edit js/data.js seperti biasa, repo GitHub dan
Vercel tetap jalan normal multi-file seperti sekarang. dist/ ini
KHUSUS buat di-Docker-in ke VM Azure.

Cara pakai:
    python3 bundle.py
lalu docker build pakai isi folder dist/, bukan folder utama.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent
DIST = ROOT / "dist"


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def inline_css(html: str, css_path: str) -> str:
    css = read(css_path)
    link_tag = f'<link rel="stylesheet" href="{css_path}">'
    return html.replace(link_tag, f"<style>\n{css}\n</style>")


def inline_scripts(html: str, script_tags_pattern: str, js_paths: list) -> str:
    """Replace a block of <script src="..."> tags with one inline <script>."""
    combined_js = "\n;\n".join(read(p) for p in js_paths)
    return re.sub(
        script_tags_pattern,
        f"<script>\n{combined_js}\n</script>",
        html,
    )


def build_index():
    html = read("index.html")
    html = inline_css(html, "css/style.css")
    html = inline_scripts(
        html,
        r'<script src="js/data\.js"></script>\s*'
        r'<script src="js/render\.js"></script>\s*'
        r'<script src="js/main\.js"></script>\s*'
        r'<script src="js/game\.js"></script>',
        ["js/data.js", "js/render.js", "js/main.js", "js/game.js"],
    )
    return html


def build_project():
    html = read("project.html")
    html = inline_css(html, "css/style.css")
    html = inline_scripts(
        html,
        r'<script src="js/data\.js"></script>\s*'
        r'<script src="js/main\.js"></script>',
        ["js/data.js", "js/main.js"],
    )
    # project.html's own inline <script>...</script> at the bottom is
    # already inline, so it needs no change — it stays as-is.
    return html


def main():
    DIST.mkdir(exist_ok=True)
    (DIST / "index.html").write_text(build_index(), encoding="utf-8")
    (DIST / "project.html").write_text(build_project(), encoding="utf-8")

    # assets/ is copied as-is (images stay as separate files for now —
    # see note at the bottom of this script about that trade-off).
    import shutil
    dist_assets = DIST / "assets"
    if dist_assets.exists():
        shutil.rmtree(dist_assets)
    shutil.copytree(ROOT / "assets", dist_assets)

    print("Bundled -> dist/index.html, dist/project.html, dist/assets/")
    print(f"  index.html:   {len((DIST/'index.html').read_text()):,} bytes")
    print(f"  project.html: {len((DIST/'project.html').read_text()):,} bytes")


if __name__ == "__main__":
    main()

# NOTE soal gambar (assets/): begitu kamu nanti upload foto asli,
# gambar-gambar itu SECARA TEKNIS masih file terpisah juga, jadi bisa
# kena masalah yang sama kalau LB ngelempar request gambar ke VM lain.
# Kalau itu kejadian nanti, kabari — bundler ini gampang di-upgrade buat
# ikut nge-embed gambar sebagai base64 langsung di dalam HTML juga.