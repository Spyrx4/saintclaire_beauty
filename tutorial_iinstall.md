# 📖 Panduan Instalasi dan Menjalankan Proyek: Saint Claire Beauty

Proyek **Saint Claire Beauty** merupakan aplikasi e-commerce kosmetik premium D2C yang terbagi menjadi dua bagian utama:
1. **Backend**: Menggunakan framework **Laravel** (menyediakan RESTful API, log aktivitas, engine pelaporan PDF, dan integrasi payment gateway/shipping).
2. **Frontend**: Menggunakan framework **Next.js** (App Router dengan TypeScript, Tailwind CSS v4, dan panel dashboard interaktif berdasarkan role).

---

## 🛠️ 1. Prasyarat Sistem (Prerequisites)

Sebelum memulai instalasi, pastikan sistem Anda telah memiliki:
*   **PHP >= 8.3**
*   **Composer** (Pengelola dependensi PHP)
*   **Node.js >= 18** (Disarankan Node.js LTS v20+) dan **npm**
*   **PostgreSQL** (Direkomendasikan untuk database utama) atau **SQLite** (Untuk pengujian cepat)

---

## 🖥️ 2. Langkah-Langkah Setup Backend (Laravel)

Ikuti langkah-langkah di bawah ini di dalam folder root proyek (`saintclaire_beauty`):

### Langkah 2.1: Duplikasi dan Setup Environment (`.env`)
1. Salin file konfigurasi `.env.example` menjadi `.env`:
   ```bash
   # Di Windows Command Prompt atau PowerShell:
   copy .env.example .env

   # Atau di Bash / Git Bash:
   cp .env.example .env
   ```
2. Buka file `.env` yang baru dibuat di VS Code atau text editor pilihan Anda.
3. Konfigurasikan koneksi database Anda. Secara default, proyek ini menggunakan **PostgreSQL**:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=saintclaire_beauty
   DB_USERNAME=postgres
   DB_PASSWORD=YOUR_POSTGRES_PASSWORD
   ```
   > [!NOTE]
   > Pastikan Anda telah membuat database kosong bernama `saintclaire_beauty` di PostgreSQL Anda sebelum melangkah ke proses migrasi.
   >
   > Jika ingin menggunakan **SQLite** untuk pengujian lokal cepat, Anda dapat menggantinya menjadi:
   > ```env
   > DB_CONNECTION=sqlite
   > ```
   > Dan buat file kosong di `database/database.sqlite`.

4. (Opsional) Setup integrasi pihak ketiga di bagian bawah `.env`:
   ```env
   # Midtrans Payment Gateway
   MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
   MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
   MIDTRANS_IS_PRODUCTION=false

   # RajaOngkir Shipping API
   RAJAONGKIR_API_KEY=YOUR_RAJAONGKIR_API_KEY
   RAJAONGKIR_BASE_URL=https://api.rajaongkir.com/starter
   RAJAONGKIR_ORIGIN_CITY=501  # Kode kota asal pengiriman (501 = Jakarta Pusat)
   ```
   > [!TIP]
   > Jika Anda belum memiliki API Key Midtrans atau RajaOngkir, sistem backend telah dilengkapi dengan **Smart Fallback**. Aplikasi akan tetap dapat melakukan estimasi ongkir statis dan checkout secara normal.

### Langkah 2.2: Instalasi Dependensi PHP
Jalankan perintah berikut di root folder proyek:
```bash
composer install
```

### Langkah 2.3: Generate Application Key
```bash
php artisan key:generate
```

### Langkah 2.4: Migrasi Database & Seeding Data Contoh
Untuk membuat tabel-tabel di database beserta data contoh (user demo, produk, dll), jalankan:
```bash
php artisan migrate --seed
```
> [!WARNING]
> Perintah di atas akan menghapus database jika Anda menambahkan flag `:fresh`. Gunakan `php artisan migrate --seed` jika ingin menjalankan migrasi di atas database yang sudah ada tanpa menghapus data lain.

---

## 🎨 3. Langkah-Langkah Setup Frontend (Next.js)

Sekarang, buka terminal baru dan arahkan ke folder `frontend`:

### Langkah 3.1: Masuk ke Folder Frontend
```bash
cd frontend
```

### Langkah 3.2: Instalasi Dependensi Node.js
Jalankan perintah ini untuk menginstal dependensi Next.js dan Tailwind CSS v4:
```bash
npm install
```

### Langkah 3.3: Konfigurasi Endpoint API (Opsional)
Secaran default, frontend akan menghubungi backend di `http://localhost:8000/api`. Jika backend Anda berjalan di port atau host yang berbeda, Anda dapat membuat file `.env.local` di dalam folder `frontend/` dan menambahkan baris berikut:
```env
NEXT_PUBLIC_API_URL=http://localhost:YOUR_CUSTOM_PORT/api
```

---

## 🚀 4. Cara Menjalankan Aplikasi (Running the Project)

Untuk menjalankan seluruh aplikasi, Anda harus menjalankan server **Backend** dan **Frontend** secara bersamaan.

### Opsi A: Menjalankan Menggunakan Shortcut Script (Direkomendasikan)
Di folder root proyek, Anda cukup menjalankan perintah:
```bash
composer run dev
```
> Perintah ini menggunakan utility `concurrently` untuk secara otomatis menjalankan:
> 1. Server Laravel (`php artisan serve` di port `8000`)
> 2. Listener Queue (`php artisan queue:listen`)
> 3. Real-time Log Logger (`php artisan pail`)
> 4. Asset compiler (`npm run dev`)
>
> Setelah itu, Anda hanya perlu membuka terminal lain dan masuk ke folder `frontend`, lalu jalankan:
> ```bash
> cd frontend
> npm run dev
> ```

### Opsi B: Menjalankan Secara Manual (Terminal Terpisah)

#### 1. Jalankan Backend Laravel:
Di folder root proyek, jalankan:
```bash
php artisan serve
```
*Backend akan berjalan di: **http://localhost:8000***

*(Opsional) Jalankan Queue Listener di terminal backend terpisah:*
```bash
php artisan queue:listen
```

#### 2. Jalankan Frontend Next.js:
Di folder `frontend/`, jalankan:
```bash
npm run dev
```
*Frontend akan berjalan di: **http://localhost:3000***

Sekarang buka browser Anda dan akses **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 5. Akun Pengujian (Demo Accounts)

Database Seeder telah menyediakan 2 role berbeda dengan data contoh yang siap diuji. Gunakan akun berikut untuk login di halaman `/login`:

| Ikon | Role | Email | Password | Hak Akses Utama |
| :---: | :--- | :--- | :--- | :--- |
| 🔧 | **Admin** | `admin@saintclaire.com` | `password` | Mengelola katalog produk/kategori/bahan aktif, melihat 9 laporan manajerial, serta memproses pesanan harian (ubah status, resi, konfirmasi COD). |
| 🛒 | **Customer** | `customer@gmail.com` | `password` | Belanja produk, checkout (COD/Midtrans), melihat riwayat pesanan & download invoice PDF. |

---

## 🗂️ 6. Struktur Folder Penting

*   `/app/Http/Controllers/Api` - Lokasi controller API Laravel (Payment, Shipping, Kasir, Order, Report, dll).
*   `/database/migrations` - Skema database tabel orders, users, products, log aktivitas, dll.
*   `/docs/documentation.md` - Log detail tahapan pengembangan & arsitektur proyek.
*   `/frontend/src/app` - Halaman frontend Next.js (Dashboard Admin di `/admin/dashboard`, Manajemen Orders Admin di `/admin/orders`, Riwayat Orders Customer di `/orders`, Cart, Checkout, dll).
*   `/frontend/src/lib/api.ts` - Konfigurasi integrasi fetch API dari frontend ke backend.
