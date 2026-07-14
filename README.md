# Nopa Finance OS

Dashboard keuangan pribadi & bisnis — frontend React + backend Supabase (Postgres, Auth, Storage).

## Setup — Step 2: Hubungkan ke Supabase

### 1. Buat project Supabase
1. Buka [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Tunggu sampai project selesai dibuat (~2 menit)

### 2. Jalankan schema database
1. Di dashboard project kamu, buka menu **SQL Editor**
2. Copy seluruh isi file `supabase/schema.sql` di folder ini
3. Paste ke SQL Editor lalu klik **Run**
4. Ini akan otomatis membuat semua tabel (accounts, transactions, sales_orders, order_items, business_mutations, goals, dll), Row Level Security, bucket Storage untuk foto profil, dan trigger pembuatan profil otomatis saat user daftar

### 3. Isi kredensial
1. Di dashboard, buka **Project Settings → API**
2. Salin **Project URL** dan **anon public key**
3. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
4. Isi `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

### 4. Jalankan
```bash
npm install
npm run dev
```

Buka `http://localhost:5173` → klik **"Belum punya akun? Daftar"** untuk membuat akun pertama.

> **Catatan:** Supabase mengirim email konfirmasi saat mendaftar. Untuk development cepat tanpa perlu cek email, kamu bisa nonaktifkan "Confirm email" di **Authentication → Providers → Email** pada dashboard Supabase.

### 5. Deploy ke Vercel
Tambahkan environment variable yang sama (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) di **Vercel → Project Settings → Environment Variables**, lalu redeploy.

---

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- **Supabase** — Postgres database, Auth, Storage (foto profil)
- Zustand (state management, sinkron ke Supabase)
- Radix UI, Framer Motion, Lucide Icons, ApexCharts

## Struktur Folder

```
supabase/
└── schema.sql        # Schema database lengkap (tabel + RLS + trigger)

src/
├── lib/
│   └── supabase.ts    # Supabase client
├── store/
│   ├── createSupabaseEntityStore.ts  # Factory generic untuk store CRUD -> Supabase
│   ├── authStore.ts                  # Auth + profil + upload foto
│   ├── salesStore.ts                 # Order + line items (relasi khusus)
│   ├── goalsStore.ts                 # Target tabungan
│   └── entityStores.ts               # Supplier, Budget, Investasi, Aset, Laporan, dll
├── components/       # (tidak berubah dari Step 1)
├── pages/            # (tidak berubah dari Step 1)
└── ...
```

## Cara Kerja Data

Setiap store menyimpan data ke tabel Supabase masing-masing, di-scope otomatis per user lewat Row Level Security (`auth.uid()`), jadi setiap akun hanya bisa melihat & mengubah datanya sendiri. Saat login, `DashboardLayout` memuat semua data dari Supabase sekali di awal; setiap tambah/hapus/ubah data langsung ditulis ke database (dengan update optimis di UI supaya terasa instan).

Order penjualan multi-produk disimpan relasional: satu baris di `sales_orders`, dan tiap produk di dalamnya jadi baris terpisah di `order_items` yang terhubung lewat `order_id`.
