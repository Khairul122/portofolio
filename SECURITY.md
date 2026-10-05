# SECURITY.md

Ringkasan perlindungan situs ini dan apa yang masih harus diatur di sisi hosting.

Situs ini **statis** (React + Vite): tidak ada backend, database, formulir, login, atau input pengguna yang diproses. Karena itu permukaan serangan injection sangat kecil, dan serangan DDoS dihadapi di lapisan CDN/edge, bukan di kode aplikasi.

## 1. Injection dan XSS (sudah diterapkan di kode)

| Perlindungan | Di mana |
|---|---|
| CSP ketat: `default-src 'self'`, tanpa skrip/gaya/font pihak ketiga, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'` | `scripts/security-headers.mjs` (sumber tunggal) |
| CSP juga disisipkan sebagai `<meta>` saat build (cadangan bila host tidak mengirim header) | `vite.config.js` |
| Font di-self-host (`@fontsource-variable/inter`), jadi tidak ada panggilan ke Google Fonts | `src/main.jsx` |
| `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (kamera, mikrofon, lokasi, dll. dimatikan), COOP/CORP `same-origin` | `scripts/security-headers.mjs` |
| Anti-clickjacking: `frame-ancestors 'none'` + `X-Frame-Options: DENY`, plus fallback JS yang menyembunyikan halaman bila di-iframe | header + `src/main.jsx` |
| Lint yang melarang sink berbahaya: `react/no-danger`, `no-eval`, `no-implied-eval`, `no-new-func`, `no-script-url`, `react/jsx-no-target-blank` | `.oxlintrc.json` (`npm run lint`) |
| Semua tautan keluar memakai `rel="noopener noreferrer"` | komponen Contact, Footer, About, Capabilities |
| `/.well-known/security.txt` untuk pelaporan celah | `public/.well-known/security.txt` |

Hasil audit kode: tidak ada `innerHTML`, `dangerouslySetInnerHTML`, `eval`, `document.write`, `localStorage`/`sessionStorage`, atau `window.open`. Semua teks dan URL berasal dari berkas konten statis, bukan dari input pengguna.

Diuji pada build produksi (`npm run preview`): model 3D, font, dan semua fitur tetap jalan di bawah CSP, tidak ada request ke origin eksternal, dan CSP terbukti memblokir skrip inline, skrip eksternal, dan gambar eksternal yang disisipkan paksa.

Satu domain eksternal diizinkan di `connect-src`: `https://api.github.com`, hanya untuk membaca daftar repo publik (data section Projects dan sejenisnya). Tidak ada kredensial, dan bila gagal situs memakai snapshot bawaan.

Dua kelonggaran CSP yang disengaja:
- `style-src 'unsafe-inline'`: framer-motion menulis atribut `style` inline. Risikonya terbatas pada styling, bukan eksekusi skrip.
- `script-src 'wasm-unsafe-eval'`: dekoder meshopt untuk model 3D adalah WebAssembly.

**Aturan ke depan:** jangan menambah `dangerouslySetInnerHTML` atau memuat skrip, font, atau gambar dari domain luar tanpa menambah domainnya ke CSP secara sadar. Bila nanti ada formulir atau backend, validasi dan escape di sisi server, dan pakai parameterized query.

## 2. DDoS (yang bisa dan tidak bisa dilakukan kode)

Kode aplikasi **tidak bisa** menghentikan DDoS: serangan menghabiskan bandwidth dan koneksi di server atau jaringan sebelum kode berjalan. Perlindungan nyata ada di hosting. Yang sudah disiapkan di repo:

- **Cache panjang** supaya banjir request ditangani CDN, bukan origin: `/assets/*` immutable 1 tahun (nama berkas ber-hash), `/models/*` dan `/images/*` 30 hari, `/index.html` `no-cache`. Dihasilkan ke `public/_headers` (Netlify dan Cloudflare Pages) dan `vercel.json` (Vercel).
- **Aset kecil**: model 3D dikompres dari sekitar 28MB jadi sekitar 3MB, background WebP 110KB, sehingga biaya bandwidth per pengunjung (dan per request jahat) jauh lebih rendah.
- **Tanpa endpoint dinamis**: tidak ada API, formulir, atau fungsi server yang bisa dibanjiri.
- `Cross-Origin-Resource-Policy: same-origin` mencegah situs lain menempelkan (hotlink) aset Anda dan menghabiskan bandwidth Anda.

Yang **harus Anda atur di hosting** (tidak bisa dari repo):

1. **Taruh situs di belakang CDN dengan proteksi DDoS.** Opsi paling mudah: host di Cloudflare Pages, atau Vercel/Netlify (sudah ada mitigasi DDoS bawaan di edge), atau arahkan domain lewat Cloudflare (proxy oranye aktif).
2. Di Cloudflare: aktifkan **Bot Fight Mode**, buat **Rate Limiting rule** (misalnya blokir IP yang lebih dari 100 request per 10 detik), dan siapkan **"I'm Under Attack" mode** untuk dinyalakan saat diserang.
3. Aktifkan **HTTPS dan HSTS** (header HSTS sudah dikirim; pastikan sertifikat aktif) dan paksa redirect HTTP ke HTTPS di hosting.
4. Bila memakai server sendiri (VPS/nginx), gunakan `limit_req` dan `limit_conn`, aktifkan gzip/brotli, dan pasang firewall (misalnya ufw + fail2ban). Jangan expose port selain 80/443.

## 3. Cara memakai

- `npm run build` otomatis membuat ulang `public/_headers` dan `vercel.json` dari `scripts/security-headers.mjs` (`npm run headers` untuk membuatnya saja). **Ubah kebijakan hanya di `scripts/security-headers.mjs`**, jangan di berkas hasil generate.
- `npm run preview` menyajikan build dengan header keamanan yang sama seperti produksi, berguna untuk mengecek apakah CSP memblokir sesuatu setelah menambah fitur. Buka console dan cari pesan "Content Security Policy".
- Menambah domain eksternal (misalnya embed atau analytics): tambahkan ke direktif yang sesuai di `cspDirectives`, lalu build ulang.
