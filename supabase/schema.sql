-- ============================================================================
-- NOPA FINANCE OS — Supabase Schema
-- ============================================================================
-- Cara pakai:
-- 1. Buat project baru di https://supabase.com/dashboard
-- 2. Buka menu "SQL Editor" di project kamu
-- 3. Copy-paste seluruh isi file ini, lalu klik "Run"
-- 4. Buka menu "Storage" > buat bucket baru bernama "avatars" (Public bucket)
-- 5. Salin Project URL & anon public key dari Settings > API ke file .env
-- ============================================================================

-- Extension untuk generate UUID
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- PROFILES (data profil user, terhubung 1:1 ke auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  role text not null default 'Owner',
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile row saat user baru daftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Helper: template kolom standar (user_id + timestamps) dipakai di semua tabel
-- ----------------------------------------------------------------------------

-- ACCOUNTS (Rekening)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bank_name text not null,
  account_number text not null default '',
  account_name text not null default '',
  balance numeric not null default 0,
  color text not null default '#2563EB',
  logo_initial text not null default 'B',
  created_at timestamptz not null default now()
);
alter table public.accounts enable row level security;
drop policy if exists "own accounts" on public.accounts;
create policy "own accounts" on public.accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TRANSACTIONS (transaksi manual dashboard)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '',
  date text not null,
  amount numeric not null default 0,
  type text not null default 'income', -- income | expense
  status text not null default 'success',
  method text not null default '',
  avatar_color text not null default '#2563EB',
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;
drop policy if exists "own transactions" on public.transactions;
create policy "own transactions" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SALES ORDERS (Penjualan)
create table if not exists public.sales_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cs text not null default '',
  tanggal text not null,
  nama_customer text not null default '',
  no_wa text not null default '',
  kode text not null default 'O',
  platform text not null default '',
  metode_pembayaran text not null default 'Transfer',
  ekspedis text not null default '',
  produk text not null default '',
  box text not null default '',
  hpp_source text not null default 'Baru',
  harga_total_produk numeric not null default 0,
  diskon_ongkir numeric not null default 0,
  total_customer_bayar numeric not null default 0,
  biaya_cod numeric not null default 0,
  pajak_cod numeric not null default 0,
  promo numeric not null default 0,
  cash_in numeric not null default 0,
  hpp numeric not null default 0,
  gross_provit numeric not null default 0,
  status text not null default 'On Proses',
  external_order_id text,
  created_at timestamptz not null default now()
);
alter table public.sales_orders add column if not exists external_order_id text;
create index if not exists sales_orders_external_order_id_idx on public.sales_orders(user_id, external_order_id);
alter table public.sales_orders add column if not exists awb_number text;
create index if not exists sales_orders_awb_number_idx on public.sales_orders(user_id, awb_number);
alter table public.sales_orders enable row level security;
drop policy if exists "own sales_orders" on public.sales_orders;
create policy "own sales_orders" on public.sales_orders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ORDER ITEMS (baris produk per order — mendukung multi-produk per order)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.sales_orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  produk text not null,
  box text not null default '1',
  hpp numeric not null default 0,
  harga_jual numeric not null default 0,
  hpp_source text not null default 'Baru'
);
alter table public.order_items enable row level security;
drop policy if exists "own order_items" on public.order_items;
create policy "own order_items" on public.order_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- BUSINESS MUTATIONS (Mutasi Bisnis: Ads / Biaya Lainnya / Prive / Return)
create table if not exists public.business_mutations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tanggal text not null,
  kategori text not null, -- Ads | Biaya Lainnya | Prive | Return
  jumlah numeric not null default 0,
  keterangan text not null default '',
  created_at timestamptz not null default now()
);
alter table public.business_mutations enable row level security;
drop policy if exists "own business_mutations" on public.business_mutations;
create policy "own business_mutations" on public.business_mutations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- GOALS (Target)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_date text not null default 'Berkelanjutan',
  collected numeric not null default 0,
  target numeric not null default 0,
  auto_linked boolean not null default false, -- true untuk goal "100 Juta Pertama"
  created_at timestamptz not null default now()
);
alter table public.goals enable row level security;
drop policy if exists "own goals" on public.goals;
create policy "own goals" on public.goals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PERSONAL TRANSACTIONS (Keuangan Pribadi, manual)
create table if not exists public.personal_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tanggal text not null,
  keterangan text not null default '',
  kategori text not null default '',
  jumlah numeric not null default 0,
  jenis text not null default 'Keluar', -- Masuk | Keluar
  created_at timestamptz not null default now()
);
alter table public.personal_transactions enable row level security;
drop policy if exists "own personal_transactions" on public.personal_transactions;
create policy "own personal_transactions" on public.personal_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- SUPPLIERS
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  produk text not null default '',
  kontak text not null default '',
  total_pembelian numeric not null default 0,
  status text not null default 'Aktif',
  created_at timestamptz not null default now()
);
alter table public.suppliers enable row level security;
drop policy if exists "own suppliers" on public.suppliers;
create policy "own suppliers" on public.suppliers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- BUDGET
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kategori text not null,
  alokasi numeric not null default 0,
  terpakai numeric not null default 0,
  sisa numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.budgets enable row level security;
drop policy if exists "own budgets" on public.budgets;
create policy "own budgets" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- INVESTMENTS
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  instrumen text not null,
  platform text not null default '',
  nilai numeric not null default 0,
  imbal_hasil text not null default '+0%',
  created_at timestamptz not null default now()
);
alter table public.investments enable row level security;
drop policy if exists "own investments" on public.investments;
create policy "own investments" on public.investments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ASSETS
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  kategori text not null default '',
  nilai numeric not null default 0,
  kondisi text not null default 'Baik',
  created_at timestamptz not null default now()
);
alter table public.assets enable row level security;
drop policy if exists "own assets" on public.assets;
create policy "own assets" on public.assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- REPORTS
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nama text not null,
  periode text not null default '',
  tipe text not null default 'Bulanan',
  dibuat text not null,
  snapshot_data jsonb,
  periode_month int,
  periode_year int,
  created_at timestamptz not null default now()
);
alter table public.reports add column if not exists snapshot_data jsonb;
alter table public.reports add column if not exists periode_month int;
alter table public.reports add column if not exists periode_year int;
alter table public.reports enable row level security;
drop policy if exists "own reports" on public.reports;
create policy "own reports" on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- EVERPRO CALLBACKS (log semua webhook masuk dari Everpro, buat audit & fallback
-- kalau auto-match ke order gagal)
-- ----------------------------------------------------------------------------
create table if not exists public.everpro_callbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  callback_type text not null default 'tracking', -- tracking | awb | bulk_order | last_mile
  awb_number text,
  client_order_no text,
  order_reference_id text,
  tracking_code text,
  cancel_reason text,
  raw_payload jsonb not null default '{}'::jsonb,
  matched_order_id uuid references public.sales_orders(id) on delete set null,
  matched boolean not null default false,
  received_at timestamptz not null default now()
);
create index if not exists everpro_callbacks_awb_idx on public.everpro_callbacks(awb_number);
alter table public.everpro_callbacks enable row level security;
drop policy if exists "own everpro_callbacks" on public.everpro_callbacks;
create policy "own everpro_callbacks" on public.everpro_callbacks for select using (auth.uid() = user_id);
-- Catatan: INSERT ke tabel ini dilakukan oleh Edge Function pakai service_role key
-- (bukan lewat RLS biasa), karena Everpro yang kirim datanya, bukan user yang login.

-- ----------------------------------------------------------------------------
-- STOCK RETURNS (log manual barang yang di-return, bisa dipakai ulang di order baru)
-- ----------------------------------------------------------------------------
create table if not exists public.stock_returns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  produk text not null,
  box text not null default '1',
  hpp numeric not null default 0,
  harga_jual numeric not null default 0,
  id_order text not null default '',
  resi_lama text not null default '',
  resi_baru text,
  status text not null default 'Tersedia', -- Tersedia | Terpakai
  used_by_order_id uuid references public.sales_orders(id) on delete set null,
  source_order_id uuid references public.sales_orders(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.stock_returns add column if not exists source_order_id uuid references public.sales_orders(id) on delete set null;
alter table public.stock_returns enable row level security;
drop policy if exists "own stock_returns" on public.stock_returns;
create policy "own stock_returns" on public.stock_returns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tambah kolom penghubung order_items -> stock_returns (baru bisa dibuat di sini
-- karena tabel stock_returns baru selesai dibuat di atas)
alter table public.order_items add column if not exists stock_return_id uuid references public.stock_returns(id) on delete set null;

-- ----------------------------------------------------------------------------
-- Storage bucket untuk foto profil (buat manual di menu Storage jika belum ada)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
