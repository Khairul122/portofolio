# DESIGN.md

Panduan desain untuk portofolio Khairul Huda. Baca ini sebelum menambah section baru supaya tampilan, gerak, dan isi tetap konsisten dengan hero.

## 1. Karakter visual

Tema "workspace developer futuristik": putih bersih, hitam, satu warna aksen tegas, sudut card terpotong, dan efek cahaya halus. Premium berarti terkendali: sedikit efek yang dikerjakan rapi, bukan banyak efek bertumpuk.

## 2. Tech stack

- Vite + React 19 (JavaScript, tanpa TypeScript), npm
- `@react-three/fiber` + `@react-three/drei` + `three` untuk karakter 3D
- `framer-motion` untuk semua animasi UI
- CSS Modules polos (tanpa Tailwind). Satu file `.module.css` per komponen
- Font: Inter Variable, di-self-host lewat `@fontsource-variable/inter` (diimpor di `main.jsx`); tidak ada Google Fonts

## 3. Design tokens

Didefinisikan di [src/index.css](src/index.css).

| Token | Nilai | Kegunaan |
|---|---|---|
| `--color-red` | `#e8342a` (default) | **Warna aksen.** Di hero ditimpa per role lewat inline style. Jangan hardcode warna aksen |
| `--color-black` | `#15181d` | Teks utama, tab aktif, latar gelap |
| `--color-white` | `#ffffff` | Latar tombol, teks di atas aksen |
| `--color-gray` | `#6b7280` | Teks sekunder, label |
| `--color-card-bg` | `rgba(255,255,255,0.97)` | Latar card |

Aturan penting:

- `--color-red` didaftarkan lewat `@property` agar bisa bertransisi halus. Nama "red" hanya historis, isinya adalah **aksen** (merah, hijau, atau biru).
- Untuk warna transparan dari aksen pakai `color-mix(in srgb, var(--color-red) 30%, transparent)`. Jangan tulis `rgba(232, 52, 42, ...)` karena tidak ikut berubah saat aksen berganti.
- Aksen per role (di `src/components/Hero/heroContent.js`): Web `#e8342a`, Android `#14803f`, SaaS `#2563eb`. Ketiganya sudah dicek kontrasnya terhadap putih. Warna aksen baru wajib kontras minimal 4.5:1 terhadap putih.

## 4. Tipografi

- Satu keluarga: Inter.
- Judul besar: weight 900, huruf kapital, `line-height` sekitar 0.96, miring `skewX(-3deg)` (lihat `.title` di `CharacterCard.module.css`).
- Label kecil: 0.66 sampai 0.78rem, weight 700 sampai 800, `letter-spacing` 0.04 sampai 0.12em, kapital.
- Angka statistik: weight 900, italic, `font-variant-numeric: tabular-nums`.
- Badan teks: 0.8 sampai 0.9rem, warna `--color-gray`.

## 5. Bentuk dan komponen

**Card** (pola dasar untuk semua panel info; contoh: `PerformanceCard`, `CharacterCard`):

- `clip-path` dengan dua sudut dipotong 24px (kiri atas dan kanan bawah)
- `padding` 26 sampai 28px, `max-width` 460px, `backdrop-filter: blur(6px)`
- `.tickMark`: garis diagonal aksen kecil di pojok kiri atas
- Spotlight hover: pseudo-element `.card::after` dengan radial-gradient yang mengikuti kursor lewat variabel `--mx` dan `--my` (diisi oleh `spotlightMove` di `spotlight.js`)
- Badge: pil dengan border `color-mix` aksen 30%
- Tombol dan tab: border 1px abu tipis, radius 8px, aktif berlatar hitam (pil meluncur dengan `layoutId`)

**Thumbnail karakter**: lingkaran 76px, border putih 3px, aktif berborder aksen, tertarik ke kursor (`Magnetic`).

**Dekorasi** (`public/images/decor/`): 33 aset transparan hasil potongan sprite sheet. Dipakai seperlunya, jangan menimpa teks atau card. Dua yang aktif: `sphere-wire-large-halo`, `sphere-wire-moons-halo`, `star-sparkle-halo` (varian dengan halo gelap).

## 6. Layout

- Breakpoint tunggal: **1023px**. Di atasnya tiga kolom (card kiri, karakter, card kanan); di bawahnya satu kolom bertumpuk (karakter dulu, lalu kedua card).
- Lebar kolom card: 420px, turun ke 360px di bawah 1280px.
- Section baru sebaiknya memakai `max-width: 1440px`, `margin: 0 auto`, padding horizontal 48px (20px di mobile).
- Background hero adalah foto ruangan (`public/images/hero-bg.webp`) dengan overscan 20px supaya parallax tidak membuka tepi.
- Posisi tengah memakai `left: 0; right: 0; margin: 0 auto`, **bukan** `transform: translateX(-50%)`. framer-motion menulis `transform` inline dan akan menimpa transform dari CSS.

## 7. Gerak (motion)

Prinsip: gerak halus, berbasis pegas, selalu menghormati `prefers-reduced-motion`.

- Bungkus aplikasi dengan `MotionConfig reducedMotion="user"` (sudah di `main.jsx`).
- Animasi imperatif (bukan prop framer-motion) harus dicek manual dengan `useReducedMotion()`: count-up, scramble teks, spin avatar, listener pointer, auto-cycle.
- Parallax pointer: nilai `-1..1` dihaluskan dengan `useSpring` di `Hero.jsx`, lalu dipetakan ke tiap lapisan dengan `useTransform`. Lapisan jauh bergerak kecil (background 8px), lapisan dekat lebih besar (bola dekor 18px, tilt card 5 derajat).
- Masuk halaman: loading screen menunggu `useProgress`, baru konten dimount sehingga animasi masuk terjadi serempak.
- Pergantian konten: `AnimatePresence mode="wait"` dengan fade 0.25s dan geser 8px.
- Angka dan bar: `CountUp` dan lebar bar teranimasi 0.9s `easeOut`, jeda bertingkat 0.15s per baris.
- Judul role: `ScrambleText` 650ms.
- Jangan campur CSS `@keyframes` dan transform framer-motion pada elemen yang sama (CSS menang atas inline style dan menimpa parallax). Pilih satu.

Efek ambient: partikel debu (`Particles`), film grain (`.grain`), ring kursor (`Cursor`, hanya `pointer: fine`).

## 8. Karakter 3D

- Model ada di `public/models/*.glb`, sudah dikompres (meshopt + tekstur WebP 1024px). File asli di `scripts/model-source/`.
- Kompres model baru:
  ```bash
  npx gltf-transform optimize in.glb public/models/nama.glb --compress meshopt --texture-compress webp --texture-size 1024
  ```
- `AvatarCanvas` menormalisasi skala ke tinggi 1.85 unit, kaki di y=0, jadi model berbagai ukuran otomatis sama tingginya. Props utama: `modelUrl`, `frameMargin` (makin besar makin zoom), `aimFraction` (titik bidik vertikal), `grounded`, `tilt`, `accent`.
- Wajib tetap: `receiveShadow` **tidak** dinyalakan pada mesh karakter (menyebabkan bercak hitam shadow acne), dan jangan pakai plane `ContactShadows` atau bloom (menimbulkan kotak samar di sekitar karakter pada canvas transparan).
- Model baru: daftarkan URL-nya di `AvatarCanvas.jsx` (konstanta + `useGLTF.preload`), tambahkan ke `ROSTER` di `Hero.jsx`, dan isi profilnya di `heroContent.js`.

## 9. Aturan isi (content)

- **Data harus asli.** Semua angka berasal dari repo GitHub `Khairul122` (203 repo publik, tanpa fork): bahasa utama per repo dan pola nama repo. Hitung ulang dari API bila ada perubahan, jangan menebak.
- Pisahkan per role: Web (bahasa web), Android (Dart, Kotlin, Java), SaaS (repo berawalan `backend`). Flutter dan Python tidak dihitung sebagai web.
- Statistik di card Character berupa teks, bukan angka. Angka hanya di card Performance (bar proporsional terhadap nilai tertinggi, bukan skor buatan).
- Hindari gaya tulisan AI: tanpa tanda pisah panjang (em dash) di teks tampilan, tanpa klaim samar ("passionate", "100+" tanpa dasar), tanpa persentase kemampuan karangan.
- Kontak hanya yang sudah diberikan pemilik (saat ini link GitHub). Jangan menambah email atau nomor tanpa izin.

## 10. Aksesibilitas

- Elemen interaktif memakai `<button>` atau `<a>` dengan `aria-label` / `aria-pressed` yang bermakna.
- Teks yang diacak (`ScrambleText`) menyediakan salinan `sr-only` berisi teks asli. Kelas `sr-only` ada di `index.css`.
- Dekorasi diberi `aria-hidden="true"` dan `alt=""`.
- Kursor kustom hanya menambah ring, kursor bawaan tetap tampil.
- Auto-cycle karakter berhenti saat kursor di kolom kanan dan dimatikan untuk reduced motion. Panah kiri dan kanan mengganti karakter.

## 11. Struktur berkas

```
public/
  images/hero-bg.webp, images/decor/*   aset gambar
  models/*.glb                         karakter 3D terkompresi
src/
  index.css                            token + reset + sr-only
  main.jsx                             MotionConfig
  App.jsx
  components/Hero/
    Hero.jsx                           orkestrasi: state, parallax, roster
    heroContent.js                     semua teks/angka per role
    AvatarCanvas.jsx                   canvas 3D (dipakai besar dan thumbnail)
    PerformanceCard.jsx / CharacterCard.jsx
    CountUp, ScrambleText, Magnetic, Cursor, Particles, LoadingScreen
    spotlight.js                       helper spotlight
    *.module.css                       gaya per komponen
scripts/
  decor-source/                        sprite sheet + skrip ekstraksi
  model-source/                        GLB asli sebelum kompresi
```

## 12. Menambah section baru (checklist)

1. Buat folder `src/components/NamaSection/` berisi `NamaSection.jsx` dan `NamaSection.module.css`. Teks dan angka taruh di berkas konten terpisah, bukan di JSX.
2. Pakai token dari bagian 3. Untuk warna aksen gunakan `var(--color-red)` dan `color-mix`, jangan hardcode.
3. Ulangi pola card (bagian 5) untuk panel info, dengan tinggi yang tidak melompat saat isi berganti (beri `min-height`).
4. Daftarkan di `App.jsx` di bawah `<Hero />`.
5. Animasi masuk saat discroll: pakai `whileInView` dengan `viewport={{ once: true }}`. Gunakan durasi 0.5 sampai 0.7s dan `easeOut` seperti hero.
6. Cek reduced motion untuk setiap animasi imperatif (bagian 7).
7. Responsif: uji di 375px, 1024px, dan 1440px. Gunakan breakpoint 1023px.
8. Data baru wajib bersumber dan bisa diverifikasi (bagian 9).
9. Jalankan `npm run build`, lalu cek console bebas error di tab yang baru dibuka.

## 12a. Transisi antar section (layer bertumpuk)

Setiap section adalah **layer** (`src/components/Shared/Layer.jsx`) di dalam `<main>` pada `App.jsx`.

- Layer `position: sticky` dan menempel di viewport. Layer yang lebih tinggi dari layar menempel dengan tepi bawahnya (`top: min(0px, 100svh - tinggi)`), jadi tetap bisa dibaca penuh sebelum ditutup. Tinggi layer diukur dengan `ResizeObserver`, sehingga otomatis responsif.
- Saat layer berikutnya naik menutupinya, layer di bawah mengecil (scale 1 ke 0.92, titik tumpu bawah) dan menggelap (overlay hitam sampai 60%). Progresnya dari `useScroll` pada elemen layer berikutnya.
- Section setelah hero punya sudut atas membulat (`--round: clamp(22px, 3.2vw, 44px)`) dan bayangan ke atas (`box-shadow: 0 -30px 70px`) supaya terasa seperti lembar yang menumpuk. Section tidak boleh memakai `clip-path` di level section (itu untuk card).
- **Layer yang tertutup penuh** memberi tahu anaknya lewat `CoveredContext` (progres >= 0.98). Komponen berat (canvas WebGL, partikel) wajib berhenti saat `covered` bernilai true, karena layer sticky yang tertutup tetap dianggap "terlihat" oleh `IntersectionObserver`.
- **Navigasi:** layer sticky melaporkan posisi menempelnya, bukan posisi aslinya, jadi `scrollIntoView` tidak dipakai. Gunakan `scrollToLayer(id)` (`Shared/scrollToLayer.js`) yang menjumlahkan tinggi layer di atasnya.
- `SectionNav`: progress bar atas dan titik navigasi kanan (disembunyikan di bawah 1023px). Section aktif dihitung dari posisi scroll (section terakhir yang tepi atasnya melewati tengah layar), bukan dari `IntersectionObserver`.
- `RevealText`: judul besar muncul per baris dari mask. Yang diamati adalah mask, bukan baris yang meluncur (baris awalnya terpotong mask sehingga tidak pernah dianggap terlihat).
- Reduced motion: layer menjadi `position: relative` (tidak menempel) tanpa scale atau dim.
- Daftar section ada di `Shared/sections.js` (dipakai nav dan footer).

**Menambah section baru:** buat komponen dengan `id`, tambahkan satu entri di `LAYERS` pada `App.jsx` (layer terakhir adalah yang paling atas), tambahkan ke `sections.js`, beri sudut atas membulat dan bayangan seperti di atas, dan pakai `RevealText` untuk judul.

## 12c. Komponen khusus

- **Lanyard (`About/Lanyard.jsx`):** kartu ID menggantung dari tepi atas section lewat strap elastis. Titik gantung dimodelkan dengan sudut dan regangan (panjang strap tambahan). Seret menarik strap (karet, strap ikut menyempit), lepaskan dan keduanya memantul dengan kecepatan pointer (tarik ke bawah lalu lepas membuat kartu terlempar ke atas lalu berayun). Kartu tertinggal sedikit dari strap lewat pegas. Tap membalik kartu.
- **Tombol Download CV:** hanya tampil bila `/cv.pdf` benar-benar ada dan bertipe PDF (letakkan berkas di `public/cv.pdf`). Tanpa pengecekan, hosting SPA akan mengembalikan `index.html` dan mengunduh "pdf" rusak.
- **Contact dan Footer:** `Contact/contactContent.js` hanya berisi kanal asli (GitHub). Email, WhatsApp, atau LinkedIn cukup ditambah sebagai entri baru di `channels`; kartu muncul otomatis, dengan tombol salin bila ada `copy`. Footer memakai `sections.js` untuk tautannya.

- **Intro video (Remotion):** sumber di `video/` (`data.js` berisi semua angka dan teks, `Recap.jsx` adegannya, `Root.jsx` dua komposisi dari satu komponen: 16:9 dan 9:16). Ubah `data.js` lalu render ulang dengan `npm run video:render` (hasil: `public/video/recap-16x9|9x16.mp4` dan poster `.jpg`); preview dengan `npm run video:studio`. Render pertama mengunduh Chromium; bila diblokir, set `REMOTION_BROWSER` ke path Chrome/Edge. Angka di video harus tetap angka asli dari repo GitHub (aturan bagian 9). Section `IntroVideo/` memuat video hanya saat dekat viewport, memutarnya hanya saat terlihat dan tidak tertutup layer berikutnya, dan tidak autoplay bila `prefers-reduced-motion`. Latar merah tua `#b0241c` (bukan merah brand) supaya teks kecil putih lolos kontras AA. Lisensi Remotion: gratis untuk individu dan tim kecil, cek syarat bila dipakai komersial.

- **Section data GitHub (Projects, Tech Stack, Journey, Activity, Quick Answers):** semua angka dan daftar repo berasal dari satu sumber, `src/data/githubStats.js` (`buildStats`). Sumbernya dinamis: situs langsung menampilkan snapshot di `src/data/github.json`, lalu `GithubProvider` mengambil data hidup dari GitHub API saat section Projects hampir terlihat (3 request, tidak ada request bila pengunjung tidak scroll sejauh itu). Bila gagal atau kena batas 60 request per jam per IP, snapshot tetap tampil. Lencana `DataSource` menunjukkan status: LIVE, FETCHING, atau SNAPSHOT. Komponen baru ambil data lewat `useGithub()`, jangan impor repo dari `github.json` langsung. Aturan yang menentukan repo mana yang dihitung ada di `src/data/mapRepos.js` (repo `portofolio` ini sendiri dikecualikan, supaya angka 203 tetap). Jalankan `npm run data` sesekali agar snapshot cadangan tidak tertinggal. Heatmap menghitung repo yang dibuat per hari, bukan commit. Angka di About ikut dinamis (jumlah repo per peran). Yang masih diketik tangan: Hero, Capabilities (daftar repo contoh), dan video Remotion.

- **Aturan antislop (audit 001, lihat `anti-slop/`):** setiap section punya komposisi sendiri, jangan menyalin header dan grid kartu section lain. Capabilities adalah panel warna yang terlipat, Projects adalah kartu demo besar plus tabel indeks, Quick Answers adalah baris pertanyaan (accordion), About memakai buku besar. Jangan menambah jendela terminal tiruan, kartu identik, angka karangan ("LV. 5+"), atau em dash di teks. Kontras: teks kecil merah di atas putih memakai campuran gelap `color-mix(in srgb, var(--color-red) 72%, #000)`, di atas gelap memakai `#ff6a5f`; latar merah dengan teks putih kecil memakai `#b0241c`; abu-abu teks memakai `--color-gray` (#565d6a). Periksa kontras sebelum menambah warna baru.

## 12b. Aturan performa

Hal-hal berikut pernah membuat situs berat. Jangan diulang di section baru.

- **Canvas WebGL:** satu canvas hidup (karakter utama) sudah cukup. Canvas statis (thumbnail) wajib `frameloop="demand"` (prop `live={false}` di `AvatarCanvas`). Canvas hidup berhenti render saat keluar layar (`useInView`). `dpr` maksimal 1.5.
- **Tanpa shadow map** kecuali ada mesh yang benar-benar `receiveShadow`. Shadow map yang tidak terpakai tetap membayar satu render pass per frame.
- **Jangan beri `filter` (drop-shadow, blur) atau `mix-blend-mode` pada elemen yang beranimasi atau menutupi layar penuh.** Browser menggambar ulang area itu tiap frame. Bayangan dekor sudah "dibakar" ke PNG (`*-halo.png`, dibuat dengan PIL).
- **Jangan animasikan overlay layar penuh.** Grain hanya statis, tanpa blend mode.
- **`backdrop-filter` tidak dipakai** di card (latar sudah 97% opak, blurnya tidak terlihat tapi mahal). `box-shadow` pada elemen ber-`clip-path` juga terpotong dan tidak terlihat, jadi jangan ditulis.
- **Partikel (canvas 2D)** hanya jalan saat terlihat (`IntersectionObserver`), `dpr` 1, jumlah kecil.
- **Gambar:** background memakai WebP (`hero-bg.webp`, 110KB; PNG asli di `scripts/image-source/`). Model GLB dikompres (bagian 8).
- Elemen yang di-tilt atau diparallax diberi `will-change: transform`.

## 12d. Keamanan

Detail lengkap di [SECURITY.md](SECURITY.md). Aturan untuk section baru: jangan pakai `dangerouslySetInnerHTML`, jangan memuat skrip, font, atau gambar dari domain luar tanpa menambahkannya ke CSP (`scripts/security-headers.mjs`), dan beri `rel="noopener noreferrer"` pada tautan `target="_blank"`. Setelah menambah fitur, jalankan `npm run build && npm run preview` dan cek console dari pesan "Content Security Policy".

## 13. Catatan teknis yang pernah jadi masalah

- Dev server memakai port otomatis bila 5173 terpakai. Cek log Vite untuk port sebenarnya.
- `heroContent.js` mengimpor konstanta URL dari `AvatarCanvas.jsx` (satu arah, tidak boleh dibalik agar tidak melingkar).
- Kunci elemen bar di `PerformanceCard` memakai `edition-label` agar animasi bar dan count-up diputar ulang saat role berganti.
