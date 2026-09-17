# Portfolio — Hilmy Fausta Pratama

Portfolio interaktif pribadi, dibuat untuk final project modul Load Balancing
(LBE 2026). Static site (HTML/CSS/JS) di-serve Nginx dari dalam container
Docker, di-deploy di VM Azure di belakang Load Balancer bersama tim.

## Struktur

```
index.html          Halaman utama (single page: hero + game intro, about,
                     skills, experience, projects, contact)
projects/            Halaman detail tiap project
css/style.css         Semua styling
js/game.js           Mini game "tangkap skill" di intro
js/main.js           Nav mobile + fallback placeholder gambar
assets/images/        Taruh foto/screenshot asli di sini
Dockerfile
nginx.conf
```

## Menambahkan gambar asli

Gambar sekarang masih placeholder (kotak putus-putus). Tinggal taruh file
dengan nama yang sama persis di folder ini, otomatis kepakai tanpa ubah kode:

- `assets/images/profile.jpg`
- `assets/images/projects/wa-bot.jpg`, `sigbot.jpg`, `librenms-notif.jpg`, `pmsig.jpg`, `bukang.jpg`
- `assets/images/zenitron/rotasi-ramadhan.jpg`, `z-sapa.jpg`, `z-clean.jpg`, `z-smile.jpg`

## Jalankan lokal (tanpa Docker)

Buka `index.html` langsung di browser, atau:

```bash
python3 -m http.server 8080
```

## Build & jalankan lewat Docker

```bash
docker build -t portfolio-hilmy .
docker run -d --name portfolio -p 8080:8080 portfolio-hilmy
```

Lalu buka `http://localhost:8080`.
