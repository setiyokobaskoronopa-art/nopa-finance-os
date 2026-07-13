# Nopa Finance OS

Dashboard keuangan pribadi & bisnis premium — tampilan (frontend only), data masih dummy.

## Menjalankan Project

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Build produksi:

```bash
npm run build
npm run preview
```

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS (v3, config-based)
- Radix UI primitives (Switch, Avatar, Tooltip, Dropdown Menu, Tabs, Progress)
- Framer Motion (animasi)
- Lucide Icons
- ApexCharts (react-apexcharts)

## Struktur Folder

```
src/
├── components/
│   ├── ui/          # Primitive reusable (Button, Card, Badge, Input, Switch, dst)
│   ├── layout/       # Sidebar, Topbar, Notification Panel, Floating Action Button
│   ├── dashboard/    # Widget khusus dashboard (KPI Card, chart wrappers, dst)
│   └── shared/       # PageHeader, DataTable, FinancePageTemplate (dipakai semua halaman)
├── layouts/          # DashboardLayout (bungkus semua halaman)
├── pages/            # 14 halaman sesuai menu sidebar
├── hooks/            # useTheme (dark/light mode)
├── types/            # Definisi TypeScript untuk data keuangan
├── data/             # Dummy data (dashboard + tiap halaman)
└── utils/            # cn() classname merge, formatCurrency, formatDate, dst
```

Semua data masih **dummy** — belum terhubung ke backend, database, Google Sheets, atau API apa pun, sesuai permintaan. Tahap berikutnya tinggal mengganti sumber data di folder `data/` dengan hasil fetch dari API/Google Sheets.
