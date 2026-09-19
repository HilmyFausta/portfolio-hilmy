/* ===========================================================
   PORTFOLIO CONTENT — edit this file to update the site.
   Everything here automatically appears on the page and on
   project detail pages. You should not need to touch any
   other .html/.css/.js file for day-to-day content updates.
   =========================================================== */

// ---------- Skills ----------
// `slug` = icon name from https://simpleicons.org (search the tool
// name there, use the slug it shows you). If a tool isn't on Simple
// Icons, add a `src` field instead with a direct image URL (see the
// "azure" example below, which uses a Devicon icon).
const SKILLS = [
  { slug: 'docker', name: 'Docker' },
  { slug: 'nginx', name: 'Nginx' },
  { slug: 'linux', name: 'Linux' },
  { slug: 'github', name: 'Git & GitHub' },
  { slug: 'n8n', name: 'n8n' },
  { slug: 'whatsapp', name: 'WhatsApp API' },
  { slug: 'ollama', name: 'Ollama' },
  { slug: 'azure', name: 'Azure', src: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/azure/azure-plain.svg' },
  { slug: 'librenms', name: 'LibreNMS', src: 'https://raw.githubusercontent.com/librenms/librenms/master/html/images/librenms.svg' },
  { slug: 'manageengine', name: 'ManageEngine', emoji: true }, // no public logo found — falls back to a plain label
  { slug: 'ubiquiti', name: 'UniFi' },
  { slug: 'html5', name: 'HTML5' },
  { slug: 'css', name: 'CSS3' },
  { slug: 'javascript', name: 'JavaScript' },
  { slug: 'c', name: 'C' },
  { slug: 'cplusplus', name: 'C++' },
  { slug: 'postgresql', name: 'PostgreSQL' },
  { slug: 'python', name: 'Python' }
];

// ---------- Experience & Organization ----------
// type: 'internship' | 'organization'
// `programs` (organization only) — each one is a clickable card.
// `link` should point at the Instagram post / documentation for it.
const EXPERIENCE = [
  {
    type: 'internship',
    role: 'Magang',
    title: 'Unit of Tech, Asset & Site Operations — SIG Pabrik Tuban',
    description: 'Membangun sistem notifikasi WA otomatis untuk monitoring jaringan (LibreNMS) dan tiket helpdesk (ManageEngine), serta web checklist preventive maintenance aset.'
  },
  {
    type: 'organization',
    role: 'Organisasi',
    title: 'Wakil Ketua Departemen Sosial Masyarakat — Zenitron',
    description: 'Mengkoordinasi 4 program kerja sepanjang periode kepengurusan.',
    programs: [
      {
        title: 'Rotasi Ramadhan',
        description: 'Penggalangan dana & bagi takjil bersama Aliansi Mahasiswa Tuban, kolaborasi Forda & BEM se-Tuban.',
        image: 'assets/images/zenitron/rotasi-ramadhan.jpg',
        link: '#'
      },
      {
        title: 'Z-Sapa',
        description: 'Kunjungan dan interaksi lintas generasi bersama lansia di Yayasan Karya Luhur Bina Asih.',
        image: 'assets/images/zenitron/z-sapa.jpg',
        link: '#'
      },
      {
        title: 'Z-Clean',
        description: 'Bersih-bersih pantai & tanam bibit mangrove di Pantai Mangrove Tuban.',
        image: 'assets/images/zenitron/z-clean.jpg',
        link: '#'
      },
      {
        title: 'Z-Smile',
        description: 'Pembelajaran dan pendampingan kreatif untuk anak-anak panti asuhan.',
        image: 'assets/images/zenitron/z-smile.jpg',
        link: '#'
      }
    ]
  }
];

// ---------- Projects ----------
// `slug` becomes the URL: project.html?slug=wa-bot
// `body` is a list of {heading, text} blocks rendered on the detail
// page, in order. `text` can include simple HTML like <code> or <a>.
const PROJECTS = [
  {
    slug: 'wa-bot',
    title: 'WA Bot Personal',
    tagline: 'Bot WhatsApp serba bisa: tanya AI, ubah foto jadi stiker, main game bareng teman, sampai catatan to-do — jalan di Azure lewat n8n, WAHA, dan Groq API.',
    tags: ['n8n', 'WAHA', 'Groq API', 'Docker', 'Azure'],
    image: 'assets/images/projects/wa-bot.jpg',
    body: [
      { heading: 'Latar belakang', text: 'Setelah terbiasa membangun bot notifikasi untuk kebutuhan kantor selama magang, saya ingin punya versi personal yang lebih santai dan multifungsi — dipakai dari nomor WhatsApp pribadi sendiri, bukan nomor terpisah.' },
      { heading: 'Fitur', text: '<code>/menu</code> — menampilkan seluruh fitur. <code>/ask</code> — tanya jawab dengan AI lewat Groq API. <code>/stiker</code> — kirim/reply foto, otomatis jadi stiker. <code>/game</code> — mini game seperti tic-tac-toe berdua. <code>/list</code> — catatan/to-do list sederhana.' },
      { heading: 'Arsitektur & perjalanan teknis', text: 'Awalnya dijalankan lokal di laptop dengan n8n + Ollama (model Qwen), lalu dipindah sepenuhnya ke Azure. Stack sekarang jalan penuh lewat Docker Compose: <code>sig-n8n</code>, <code>sig-waha</code>, dan sidecar Node.js <code>sticker-sidecar</code> khusus fitur stiker. Untuk <code>/ask</code>, akhirnya beralih penuh ke Groq API supaya tetap gratis tanpa membebani resource VM.' }
    ]
  },
  {
    slug: 'sigbot',
    title: 'SIGBOT — Notifikasi Tiket ManageEngine',
    tagline: 'Notifikasi WA otomatis untuk tiket ManageEngine ServiceDesk, dengan saran AI lokal.',
    tags: ['n8n', 'Ollama', 'Python'],
    image: 'assets/images/projects/sigbot.jpg',
    body: [
      { heading: 'Masalah yang diselesaikan', text: 'Tim helpdesk perlu tahu status tiket ManageEngine secara real-time tanpa terus membuka dashboard. API-nya sendiri terbatas — hanya bisa menarik 10 tiket terbaru sekali panggil.' },
      { heading: 'Cara kerja', text: 'Script Python cronjob mengunduh tiket ke database JSON lokal. Workflow n8n <b>SIGBOT</b> berjalan tiap 3 menit: membaca JSON, memfilter tiket grup "Site Support Helpdesk Tuban", mengkategorikan (baru, mendekati deadline, overdue, macet, selesai), lalu AI lokal (Ollama) menyusun saran singkat sebelum dikirim ke grup WhatsApp lewat WAHA.' },
      { heading: 'Detail teknis', text: 'Pelacakan notifikasi yang sudah terkirim disimpan di static data workflow n8n, terpisah dari database tiket mentah.' }
    ]
  },
  {
    slug: 'librenms-notif',
    title: 'Notifikasi Jaringan Down — LibreNMS',
    tagline: 'Sistem notifikasi WA saat switch/jaringan down, dibangun dari nol termasuk instalasi LibreNMS-nya.',
    tags: ['LibreNMS', 'SNMP', 'n8n', 'WAHA'],
    image: 'assets/images/projects/librenms-notif.jpg',
    body: [
      { heading: 'Titik berangkat', text: 'Kantor belum punya LibreNMS sama sekali — proyek ini dimulai dari instalasi dan konfigurasi SNMP tiap perangkat.' },
      { heading: 'Yang dikerjakan', text: 'Instalasi LibreNMS dari dokumentasi resmi, riset LibreNMS API, dan workflow n8n dengan 4 cabang: status device up/down, perubahan port/STP, health check suhu/CPU/memory, dan webhook alert native LibreNMS.' },
      { heading: 'Perluasan', text: 'Kantor juga memonitor wifi lewat UniFi Network Application — jadi bahan pertimbangan masuk ke sistem notifikasi yang sama di iterasi berikutnya.' }
    ]
  },
  {
    slug: 'pmsig',
    title: 'Web PM SIG — Preventive Maintenance Checklist',
    tagline: 'Web checklist preventive maintenance untuk aset kantor: PC, laptop, printer, dan switch.',
    tags: ['Web App', 'PM2'],
    image: 'assets/images/projects/pmsig.jpg',
    body: [
      { heading: 'Tentang proyek', text: 'Dikerjakan berdua dengan rekan magang, menggantikan pencatatan manual preventive maintenance jadi checklist digital.' },
      { heading: 'Deployment', text: 'Frontend build dengan <code>pnpm run build</code>, backend lewat PM2, diakses HTTPS dalam LAN kantor — bukan hosting publik.' },
      { heading: 'Rencana lanjutan', text: 'Integrasi notifikasi WA untuk checklist selesai/menunggu approval, pengingat deadline periode PM, dan rekap harian per kategori aset.' }
    ]
  },
  {
    slug: 'bukang',
    title: 'Buku Angkatan',
    tagline: 'Web sederhana yang terhubung ke Google Sheets & Slides untuk pengerjaan buku angkatan bareng-bareng.',
    tags: ['Google Apps Script', 'HTML'],
    image: 'assets/images/projects/bukang.jpg',
    body: [
      { heading: 'Tentang proyek', text: 'Sebuah <code>index.html</code> sederhana yang terhubung Google Apps Script, membaca/menulis data dari Google Spreadsheet dan Google Slide untuk koordinasi buku angkatan.' },
      { heading: 'Repository', text: '<a href="https://github.com/HilmyFausta/bukang" target="_blank" rel="noopener">Lihat di GitHub &rarr;</a>' }
    ]
  }
];

// ---------- Contact ----------
const CONTACT = [
  { label: 'Email', href: 'mailto:hilmy@example.com' },
  { label: 'GitHub', href: 'https://github.com/HilmyFausta' },
  { label: 'LinkedIn', href: '#' }
];