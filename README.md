# PlayLearn — Clone Wordwall (Fase 1)

Platform pembuatan **game pembelajaran interaktif**. Guru membuat satu set konten,
lalu memainkannya dalam berbagai **template game** tanpa input ulang, dan
membagikannya ke siswa lewat **link publik tanpa akun**.

> Konsep inti: **DATA KONTEN dipisah tegas dari TEMPLATE TAMPILAN.** Satu aktivitas
> (`content` jsonb) bisa di-_switch_ ke template lain dalam 1 klik.

---

## ✨ Fitur (MVP Fase 1)

- 🔐 **Auth guru** (Supabase Auth) + **pemain anonim** lewat link publik
- 🗂 **Dashboard "Aktivitas Saya"** — buat, edit, duplikat, hapus
- ✏️ **Editor konten universal** — input data sekali, split view + **live preview**
- 🔀 **Switch Template** — ubah satu aktivitas ke template lain (tandai kompatibilitas)
- 🎮 **Mode Main** fullscreen — interaktif, skor + timer + akurasi
- 🏆 **Leaderboard real-time** per aktivitas (main bareng di kelas)
- 🔗 **Bagikan** via link slug + **embed iframe**
- 🎨 **Tema visual** (5 tema) — ganti tampilan tanpa ubah konten

### 6 Template game

| Template      | Shape konten | Mekanik |
|---------------|--------------|---------|
| Quiz          | `items`      | Pilih jawaban benar, skor + timer + nav keyboard |
| Open the Box  | `items`      | Klik kotak → buka item acak |
| Random Wheel  | `items`      | Putar roda → pilih item acak |
| Match Up      | `pairs`      | Tarik & jodohkan (dnd-kit) |
| Flash Cards   | `pairs`      | Balik kartu dua sisi, maju/mundur |
| Anagram       | `words`      | Susun huruf acak jadi kata |

Quiz / Open the Box / Random Wheel berbagi shape **`items`**; Match Up / Flash Cards
berbagi **`pairs`**. Switch antar-template satu grup mulus tanpa kehilangan data;
lintas grup memakai konversi best-effort (lihat [`contentEngine.ts`](src/lib/contentEngine.ts)).

---

## 🚀 Menjalankan secara lokal

### 1. Prasyarat
- Node.js 18+ dan npm
- (Opsional, untuk backend penuh) [Supabase CLI](https://supabase.com/docs/guides/cli)

### 2. Install & jalankan
```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # buka http://localhost:5173
```

> **Tanpa Supabase?** Aplikasi tetap jalan dalam **mode demo lokal** (in-memory):
> langsung masuk sebagai "Guru Demo", lengkap dengan aktivitas contoh & leaderboard.
> Perubahan tidak tersimpan permanen.

### 3. Mengaktifkan backend Supabase

**Opsi A — Supabase lokal (CLI, paling cepat untuk dev):**
```bash
supabase init           # aman: migration di supabase/migrations/ tetap dipakai
supabase start          # jalankan Postgres + Auth + Realtime lokal
supabase db reset       # terapkan migration + seed.sql (guru & aktivitas demo)
```
Isi `.env` dengan URL & anon key yang ditampilkan `supabase start`:
```
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<anon key dari output supabase start>
```

**Opsi B — Project Supabase hosted:**
1. Buat project di [supabase.com](https://supabase.com).
2. SQL Editor → jalankan isi [`supabase/migrations/20250529120000_init.sql`](supabase/migrations/20250529120000_init.sql).
3. (Opsional) jalankan bagian `INSERT activities` di [`supabase/seed.sql`](supabase/seed.sql)
   dengan `owner_id` = UUID akunmu (daftar dulu lewat UI aplikasi).
4. Project Settings → API → salin **URL** & **anon public key** ke `.env`.

**Login demo (setelah `supabase db reset`):** `demo@playlearn.app` / `demo123456`

---

## 🗄 Arsitektur backend (full Supabase)

Tidak ada server kustom, tidak ada Edge Function di Fase 1. Hanya **Postgres + RLS +
Auth + Realtime + Storage**, diakses dari frontend memakai **anon key** (tidak pernah
service key).

- **`activities`** — 1 baris = 1 set konten. `content` jsonb template-agnostic;
  `template_type` bisa diganti tanpa ubah konten.
- **`play_results`** — hasil main, boleh di-INSERT siapa pun **hanya** untuk
  aktivitas `is_public = true` (RLS), agar pemain anonim aman.
- **RLS** — pemilik akses penuh ke aktivitasnya; publik hanya baca yang `is_public`.
- **Realtime** — `play_results` dipublikasikan untuk leaderboard live; channel
  selalu dibersihkan saat unmount ([`Leaderboard.tsx`](src/components/Leaderboard.tsx)).
- Skor Fase 1 dihitung **client-side** (cukup untuk MVP).
- Setiap perubahan skema = file migration baru (jangan edit langsung di dashboard).

---

## 🧩 Arsitektur frontend

```
src/
├── types/                  # model domain & jsonb (content.ts = shape template-agnostic)
├── lib/
│   ├── supabase.ts         # client + deteksi konfigurasi
│   ├── api.ts              # SATU pintu akses data (+ fallback mode demo)
│   ├── contentEngine.ts    # shape, kompatibilitas, & KONVERSI antar-template
│   ├── scoring.ts          # perhitungan skor client-side
│   ├── themes.ts           # definisi tema visual
│   └── utils.ts
├── templates/              # ⬅️ KOMPONEN TEMPLATE (presentasi)
│   ├── types.ts            # props seragam { content, settings, theme, onComplete }
│   ├── registry.tsx        # registry — satu-satunya tempat daftar template
│   ├── QuizTemplate.tsx … FlashCardsTemplate.tsx
│   └── shared.tsx
├── components/
│   ├── editor/             # editor universal + sub-editor per shape + switch grid
│   ├── game/               # GameStage (tema) + GameHud (skor/timer)
│   ├── Leaderboard.tsx     # realtime
│   ├── ShareModal.tsx      # link + embed
│   └── ui.tsx, TopBar.tsx
├── pages/                  # Login, Dashboard, Editor, Play
├── store/auth.ts           # Zustand (sesi + mode demo)
└── App.tsx                 # routing
```

### Menambah template baru (tanpa mengubah editor inti)
1. Buat komponen di `src/templates/XxxTemplate.tsx` dengan props `TemplateProps`
   (`{ content, settings, theme, preview?, onComplete }`).
2. Daftarkan satu entry di [`src/templates/registry.tsx`](src/templates/registry.tsx)
   (tentukan `shape`: `items` | `pairs` | `words`).

Editor universal, switch-template, dan play mode otomatis mengenalinya.

---

## 📦 Skrip

| Perintah         | Fungsi |
|------------------|--------|
| `npm run dev`    | Dev server (Vite) |
| `npm run build`  | Type-check + build produksi ke `dist/` |
| `npm run preview`| Preview hasil build |
| `npm run lint`   | `tsc --noEmit` |

---

## 🌐 Deploy (catatan SPA)

Aplikasi memakai routing sisi-klien (`/p/:slug`, `/embed/:slug`). Saat deploy ke
hosting statis (Vercel/Netlify/Cloudflare Pages), aktifkan **SPA fallback** (semua
rute → `index.html`) agar link publik & embed langsung bisa dibuka.

---

## 🔮 Fase 2 (belum dikerjakan)

Karena `content` berupa jsonb ternormalisasi terpisah dari template, fitur AI cukup
ditambah sebagai **satu tombol "Generate dengan AI"** di editor yang mengisi `content`
otomatis — lewat Supabase Edge Function (menyembunyikan API key), **tanpa** mengubah
arsitektur inti.
