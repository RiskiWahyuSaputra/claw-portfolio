# Claw Machine Portfolio

Portofolio developer Riski Wahyu Saputra dalam bentuk mesin capit arcade interaktif.
Setiap collectible di dalam mesin membuka satu section portofolio:
**PLAY → PILIH COLLECTIBLE → CAPIT BERGERAK → GRAB → SECTION TERBUKA → EXPLORE.**

Dibangun dengan Next.js 16, React 19, TypeScript, Tailwind CSS 4, React Three Fiber, GSAP, dan Framer Motion.
Seluruh mesin 3D dibuat prosedural dan semua suara disintesis dengan Web Audio, jadi tidak ada file model atau audio.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # memperbarui snapshot GitHub, lalu build produksi
npm start
```

## Kontrol

| Aksi | Desktop | Mobile |
| --- | --- | --- |
| Quick Select | Klik prize di mesin, daftar konsol, atau tombol `1`-`6` | Tap prize atau daftar konsol |
| Gerak capit | `←` `→`, tombol LEFT/RIGHT, joystick | LEFT/RIGHT, joystick |
| Turunkan capit | `Space` atau DROP | DROP |
| Tutup section | `Esc`, BACK TO MACHINE, tombol back browser | BACK TO MACHINE |

Joystick, LEFT/RIGHT, DROP, dan slot koin pada mesin 3D juga bisa diklik langsung.

## Struktur

```
src/
  game/                 Logika game, tanpa React dan tanpa renderer
    engine.ts           Urutan grab (GSAP), kunci animasi, skor
    pose.ts             State per-frame yang dibaca renderer
    store.ts            State UI (Zustand)
    layout.ts           Koordinat dunia: posisi prize, chute, batas capit
    audio.ts            Musik dan efek suara
    capabilities.ts     Memilih renderer 3D atau Lite
  components/
    machine3d/          Renderer WebGL
    lite/               Renderer fallback CSS 3D
    hud/                Top bar, dock, konsol, loader, partikel
    sections/           Enam section portofolio
  data/                 Semua konten. Edit di sini untuk mengubah isi situs
```

`engine.ts` hanya menulis ke `pose`. Renderer 3D dan Lite sama-sama membacanya,
sehingga aturan permainan identik di keduanya.

## Mengubah konten

- Profil, kontak, filosofi: `src/data/profile.ts`
- Project: `src/data/projects.ts` (gambar di `public/projects`)
- Timeline: `src/data/journey.ts`
- Sertifikat: `src/data/certificates.ts`
- Skill: `src/data/skills.ts`
- Nama, warna, dan urutan section: `src/data/collectibles.ts`

## Data GitHub

`npm run github` memperbarui `src/data/github.json`, dan `npm run build` melakukannya otomatis.
Kalender kontribusi diambil dari halaman profil publik, sedangkan repo, commit, dan bahasa dihitung dari repo publik saja.
Token diambil dari `GITHUB_TOKEN` atau login `gh`. Jika gagal saat build, snapshot lama tetap dipakai.

## Form kontak

Isi `RESEND_API_KEY` di `.env.local` (lihat `.env.example`) agar pesan terkirim lewat [Resend](https://resend.com).
Tanpa key tersebut, form membuka aplikasi email pengunjung dengan pesan yang sudah terisi.

## Fallback

Mode Lite (CSS 3D) aktif otomatis jika WebGL tidak tersedia, perangkat lemah, Data Saver menyala, frame rate terus rendah, atau scene 3D gagal.
Pengunjung juga bisa berpindah lewat tombol `3D`/`LITE`. Untuk menguji: `?renderer=lite` atau `?renderer=3d`.
`prefers-reduced-motion` dipatuhi: urutan capit dipercepat dan animasi dekoratif dimatikan.
