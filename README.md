# Portfolio — Hilmy Fausta Pratama

Portfolio interaktif pribadi, dibuat untuk final project modul Load Balancing
(LBE 2026). Static site (HTML/CSS/JS) di-serve Nginx dari dalam container
Docker, di-deploy di VM Azure di belakang Load Balancer bersama tim.

## Struktur

```
index.html           Halaman utama (hero + game intro, about, skills,
                      experience, projects, contact) — sections-nya
                      di-render otomatis dari js/data.js
project.html          Halaman detail — dipakai bareng semua project lewat
                      project.html?slug=nama-project
js/data.js             SATU-SATUNYA FILE yang perlu diedit buat nambah/ubah
                      konten: skills, experience, proker (+link IG), project, kontak
js/render.js           Baca js/data.js, otomatis bangun semua tampilan
js/game.js            Mini game "tangkap skill" di intro (icon-nya ikut js/data.js)
js/main.js            Nav mobile + fallback placeholder gambar
css/style.css          Semua styling
assets/images/         Taruh foto/screenshot asli di sini
Dockerfile
nginx.conf
```

## Menambahkan konten (skill, pengalaman, project, kontak)

Buka **`js/data.js`**, tinggal tambah satu objek baru di array yang sesuai
(`SKILLS`, `EXPERIENCE`, `PROJECTS`, atau `CONTACT`). Simpan, refresh browser
— otomatis muncul di halaman, termasuk angka statistik di hero yang ikut
ke-update sendiri. Nggak perlu edit `index.html` atau bikin file HTML baru
sama sekali, termasuk buat halaman detail project (otomatis kebentuk dari
`project.html?slug=...`).

## Menambahkan gambar asli

Gambar sekarang masih placeholder (kotak putus-putus). Tinggal taruh file
dengan nama yang sama persis dengan yang ditulis di `js/data.js`, otomatis
kepakai tanpa ubah kode lain:

- `assets/images/profile.jpg`
- `assets/images/projects/wa-bot.jpg`, `sigbot.jpg`, `librenms-notif.jpg`, `pmsig.jpg`, `bukang.jpg`
- `assets/images/zenitron/rotasi-ramadhan.jpg`, `z-sapa.jpg`, `z-clean.jpg`, `z-smile.jpg`

Rasio disarankan: foto profil 4:5, foto project 16:10, foto proker 4:3.
Compress dulu pakai [squoosh.app](https://squoosh.app) (format WebP,
kualitas ~75-80%) biar tiap foto di bawah ±200KB — situs tetap cepat dibuka.

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