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

## Build & jalankan lewat Docker (deploy ke VM di belakang Load Balancer)

**Wajib jalanin `bundle.py` dulu sebelum `docker build`.** Load Balancer
kerja per-koneksi TCP, bukan per-halaman — kalau CSS/JS masih file
terpisah, browser bisa "dilempar" ke VM lain di tengah loading satu
halaman (VM lain isinya portofolio orang lain). `bundle.py` menggabungkan
semua CSS+JS jadi inline di dalam satu file HTML, jadi cuma ada 1
request per kunjungan — nggak ada celah buat ke-split ke VM lain.

```bash
python3 bundle.py
docker build -t portfolio-hilmy .
docker run -d --name portfolio -p 8080:8080 --restart unless-stopped portfolio-hilmy
```

Lalu buka `http://localhost:8080`.

`bundle.py` cuma MEMBACA `index.html`/`css/`/`js/` dan nulis hasil
gabungannya ke folder `dist/` (nggak ngubah source aslinya sama
sekali) — jadi tetap edit `js/data.js` seperti biasa buat nambah
konten, lalu jalanin ulang `bundle.py` sebelum build/deploy berikutnya.

**Kalau cuma buat preview di Vercel** (bukan di belakang Load
Balancer), nggak perlu `bundle.py` sama sekali — Vercel bukan
multi-VM, jadi nggak kena masalah ini. Struktur multi-file yang
sekarang udah langsung jalan normal di situ.