# Documentation - Saint Claire Beauty Project

Dokumen ini mencatat langkah-langkah pengembangan proyek **Saint Claire Beauty** secara kronologis.

---

## 📅 [2026-04-28] - Step 1: Project Initialization

### 1.1 Persiapan Dokumen
*   Menganalisis file rancangan `Rancangan_11_Laporan_ECommerce - Copy.docx`.
*   Menganalisis file instruksi `instruction.md`.
*   Menyusun Roadmap pengembangan dalam 6 tahap utama.

### 1.2 Inisialisasi Project Laravel
*   Status: **Selesai**
*   Deskripsi: Skeleton framework Laravel 11 telah diinstal menggunakan Composer.

### 1.3 Konfigurasi Environment
*   File `.env` telah dikonfigurasi dengan `APP_KEY` yang unik.
*   Konfigurasi database diarahkan ke **PostgreSQL** pada port `5433`.
*   Struktur folder dibersihkan, dokumen rancangan dipindahkan ke folder `docs/` untuk menjaga kerapihan root project.

---

## 📅 [2026-04-28] - Step 2: Database Schema & Migrations

### 2.1 Perancangan Tabel
*   **Categories & Products**: Menambahkan kolom teknis seperti `ph_level`, `texture`, `cost_price`, `selling_price`, dan `threshold` untuk stok kritis.
*   **Ingredients**: Menyiapkan tabel bahan aktif untuk fitur filter teknis.
*   **Cart & Orders**: Implementasi *Persistent Cart* dan struktur transaksi yang mendukung pelaporan invoice dan surat jalan.
*   **Logs**: Menyiapkan `activity_logs` untuk audit trail admin dan `search_logs` untuk analisis tren bahan aktif.

### 2.2 Eksekusi Migrasi
*   Status: **Selesai**
*   Deskripsi: Semua tabel telah berhasil dimigrasi ke database **PostgreSQL** (Port 5433). Relasi antar tabel telah didefinisikan pada level database menggunakan *foreign keys*.

---

## 📅 [2026-04-28] - Step 3: Core Backend Logic (API)

### 3.1 Autentikasi (Sanctum)
*   Menginstal Laravel Sanctum untuk pengamanan API berbasis token.
*   Implementasi `AuthController` untuk fitur Register, Login, dan Logout.
*   Menambahkan kolom `role` (admin, staff, customer) dan `tier` (regular, elite, exclusive) pada tabel users.

### 3.2 Modul Produk & Filter Teknis
*   Implementasi `ProductController` dengan fitur **Advanced Technical Filter**.
*   Query API memungkinkan penyaringan berdasarkan:
    *   `category` (Kategori produk)
    *   `min_ph` & `max_ph` (Rentang pH Level)
    *   `texture` (Tekstur produk)
    *   `ingredients` (Kombinasi bahan aktif)

### 3.3 Manajemen Data
*   Implementasi CRUD API untuk `Categories` dan `Ingredients`.
*   Mendefinisikan relasi Eloquent Many-to-Many antara `Products` dan `Ingredients`.

---

## 📅 [2026-04-28] - Step 4: Transaction & Payment Integration

### 4.1 Persistent Cart
*   Implementasi `CartController` untuk mengelola keranjang belanja yang tersimpan di database.
*   Data keranjang otomatis tersinkronisasi berdasarkan `user_id`, memungkinkan fitur belanja lintas perangkat.

### 4.2 Checkout & Manajemen Stok
*   Implementasi alur Checkout di `OrderController`.
*   Sistem secara otomatis:
    *   Menghitung total belanja.
    *   Mengurangi stok produk saat pesanan dibuat.
    *   Mengembalikan stok jika pesanan dibatalkan (sebelum diproses).
    *   Menghasilkan nomor transaksi unik (`TRX-...`).

### 4.3 Integrasi Pengiriman
*   Menyiapkan kolom `courier` dan `shipping_address` pada modul order.

---

## 📅 [2026-04-28] - Step 5: Reporting Engine (The 11 Reports)

### 5.1 Pengembangan ReportController
*   Implementasi logika pengambilan data untuk 11 jenis laporan manajerial sesuai rancangan `.docx`.
*   Fitur laporan yang telah siap (API Output):
    1.  **Laporan Penjualan Bulanan**: Filter berdasarkan bulan/tahun.
    2.  **Laporan Inventaris Barang**: Data stok dan harga satuan.
    3.  **Laporan Produk Terlaris**: Analisis produk *Fast Moving* berdasarkan volume penjualan.
    4.  **Laporan Pelanggan Eksklusif**: Data user berdasarkan Tier (Regular/Exclusive).
    5.  **Laporan Stok Kritis**: Menampilkan produk yang stoknya di bawah ambang batas (*threshold*).
    6.  **Laporan Transaksi Dibatalkan**: Analisis pembatalan pesanan.
    7.  **Laporan Laba Rugi**: Menghitung margin keuntungan per produk.
    8.  **Audit Trail**: Log aktivitas administratif.
    9.  **Analisis Bahan Aktif**: Analisis tren pencarian bahan aktif (Retinol, Niacinamide, dll) untuk rekomendasi restok.

### 5.2 Integrasi Endpoint Pelaporan
*   Semua laporan dapat diakses melalui endpoint `/api/reports/...` dengan autentikasi yang sesuai.

---

## 📅 [2026-04-28] - Step 2.3: Database Seeding

### 2.3.1 Data Contoh Realistik
*   **Users**: 
    *   Admin (`admin@saintclaire.com`) untuk akses dashboard.
    *   Exclusive Customer (`customer@gmail.com`) untuk pengujian tier eksklusif.
*   **Categories**: Cleanser, Toner, Serum, Moisturizer, Sunscreen.
*   **Ingredients**: Retinol, Vitamin C, Niacinamide, Hyaluronic Acid, Salicylic Acid, Ceramides.
*   **Products**: 
    *   `SC-RE-001` (Retinol Serum) - pH 5.5.
    *   `SC-NI-001` (Niacinamide Cream) - pH 6.0.
    *   `SC-VC-001` (Vitamin C Toner) - pH 4.5.
    *   Menambahkan data stok kritis untuk pengujian laporan inventaris.

### 2.3.2 Status Seeding
*   Status: **Selesai**
*   Deskripsi: Database PostgreSQL telah diisi dengan data awal yang siap digunakan untuk pengujian Frontend dan Reporting.

---

## 📅 [2026-04-28] - Step 6: Frontend Integration (Next.js)

### 6.1 Inisialisasi Project Frontend
*   Status: **Selesai**
*   Deskripsi: Menginisialisasi project Next.js 15 (App Router) di dalam folder `frontend/` menggunakan TypeScript.
*   Konfigurasi awal: Menyiapkan struktur folder `src/app` dan membersihkan boilerplate bawaan.

### 6.2 Desain UI & Aesthetic
*   Status: **Selesai**
*   Konsep: **Premium Beauty D2C**. Menggunakan palet warna mewah (Deep Plum, Gold, Soft Cream) dan tipografi modern (Outfit & Playfair Display).
*   Teknologi: Vanilla CSS dengan variabel CSS untuk tema yang konsisten. Implementasi Glassmorphism pada Navbar dan komponen filter.

### 6.3 Implementasi Halaman Utama
*   Status: **Selesai**
*   Deskripsi: Membangun Landing Page yang mencakup Hero Section, Preview Filter Teknis (pH Level, Ingredients), dan Galeri Produk.
*   Fitur: Animasi halus (*fade-in*), desain responsif, dan navigasi yang elegan.

### 6.4 API Utility & Autentikasi
*   Status: **Selesai**
*   Deskripsi: Membuat utilitas `api.ts` menggunakan Fetch API untuk komunikasi dengan Backend Laravel.
*   Fitur: 
    *   Penanganan token Bearer otomatis dari LocalStorage.
    *   Halaman **Login Premium** yang terhubung dengan API autentikasi.
    *   Proteksi rute sederhana dan pengalihan (redirect) berdasarkan Role (Admin/Customer).

### 6.5 Integrasi Dashboard Laporan
*   Status: **Selesai**
*   Deskripsi: Menghubungkan sidebar laporan pada Admin Dashboard dengan 11 endpoint laporan manajerial di Backend.
*   Fitur:
    *   Data dinamis yang ditarik langsung dari PostgreSQL.
    *   Tabel laporan yang responsif dengan fitur pembersihan nama kolom otomatis.
    *   Indikator loading yang elegan saat memproses data besar.
### 6.6 Visual Asset Integration
*   Status: **Selesai**
*   Deskripsi: Mengganti placeholder dengan asset visual premium hasil generasi AI.
*   Fitur:
    *   **Hero Banner**: Banner estetis dengan tema Deep Plum & Gold.
    *   **Product Thumbnails**: Foto produk kelas atas untuk galeri.
    *   **Premium Cards**: Desain kartu produk yang lebih hidup dengan efek hover dan detail teknis (pH, Texture).

### 6.7 Perbaikan Tailwind CSS v4
*   Status: **Selesai**
*   Masalah: Semua utility class Tailwind (`flex`, `grid`, `rounded-full`, `text-primary`, dll.) tidak berfungsi karena `globals.css` tidak pernah mengimpor Tailwind.
*   Solusi:
    *   Menambahkan `@import "tailwindcss"` di baris pertama `globals.css`.
    *   Mendaftarkan token warna & font via blok `@theme` (Tailwind v4 syntax).
    *   Memindahkan Google Fonts dari CSS `@import` (yang konflik urutan) ke tag `<link>` di `layout.tsx`.
*   Hasil: Seluruh layout (flex, grid, warna, tipografi, glassmorphism) kini berfungsi sempurna.

---

## 📅 [2026-04-28] - Step 7: RBAC & Security Fixes

### 7.1 Latar Belakang & Masalah yang Ditemukan
Setelah audit menyeluruh, ditemukan **5 celah keamanan kritis**:
1.  Tidak ada pembagian akses (RBAC) sama sekali — semua endpoint terbuka untuk semua user login.
2.  Endpoint `POST /register` memperbolehkan siapapun mendaftarkan diri sebagai `admin`.
3.  CRUD produk (`POST/PUT/DELETE /products`) terbuka tanpa autentikasi apapun.
4.  `OrderController::show()` tidak memvalidasi kepemilikan — user A bisa melihat pesanan user B.
5.  Halaman `/admin/dashboard` di frontend dapat diakses siapapun tanpa pengecekan role.

### 7.2 Penambahan Role Owner
*   Status: **Selesai**
*   Deskripsi: Menambahkan role **Owner** sebagai pihak pemilik bisnis yang dapat melihat seluruh laporan manajerial namun tidak mengelola operasional harian.
*   Akun: `owner@saintclaire.com` / `password`

**Matriks Hak Akses (Role Matrix):**

| Fitur | Owner | Admin | Customer |
|-------|:-----:|:-----:|:--------:|
| Lihat Katalog Produk | ✅ | ✅ | ✅ |
| CRUD Produk | ❌ | ✅ | ❌ |
| 9 Laporan Manajerial | ✅ | ✅ | ❌ |
| Kelola Semua Pesanan | ❌ | ✅ | ❌ |
| Keranjang & Checkout | ❌ | ❌ | ✅ |
| Pesanan Milik Sendiri | ❌ | ❌ | ✅ |

### 7.3 Backend RBAC (Laravel)

#### 7.3.1 RoleMiddleware
*   File baru: `app/Http/Middleware/RoleMiddleware.php`
*   Mendukung multi-role: `middleware('role:owner,admin')` mengizinkan owner DAN admin.
*   Menolak akses dengan HTTP 403 beserta pesan role yang dibutuhkan vs role user.
*   Didaftarkan sebagai alias `role` di `bootstrap/app.php`.

#### 7.3.2 Restrukturisasi `routes/api.php`
*   **Public** (tanpa login): `GET /products`, `GET /categories`, `GET /ingredients`, `POST /register`, `POST /login`.
*   **Customer** (`middleware('role:customer')`): Semua endpoint Cart dan Order milik sendiri.
*   **Admin** (`middleware('role:admin')`): CRUD produk, kategori, bahan aktif; kelola semua pesanan.
*   **Owner + Admin** (`middleware('role:owner,admin')`): 9 endpoint laporan manajerial.

#### 7.3.3 Perbaikan AuthController
*   Register kini selalu menetapkan `role = 'customer'` secara hardcode.
*   Tidak ada lagi parameter `role` yang dapat dimanipulasi dari request.

#### 7.3.4 Perbaikan OrderController
*   `index()`: Customer hanya melihat pesanan miliknya.
*   `show()`: Validasi kepemilikan (`where user_id = auth user`).
*   `allOrders()`: Endpoint baru khusus admin untuk melihat semua pesanan.
*   `updateStatus()`: Endpoint baru khusus admin untuk mengubah status pesanan.

### 7.4 Frontend Auth Guard (Next.js)

#### 7.4.1 `src/lib/auth.ts`
*   Helper functions: `getUser()`, `getToken()`, `isLoggedIn()`, `isAdmin()`, `isOwner()`, `isAdminOrOwner()`, `logout()`.

#### 7.4.2 `src/components/AuthGuard.tsx`
*   Wrapper component untuk proteksi halaman.
*   Opsi `requireRole`: `"admin"`, `"owner"`, `"admin_or_owner"`, `"customer"`.
*   Redirect otomatis ke `/login` jika belum login, atau ke `/` jika role tidak sesuai.

#### 7.4.3 `src/components/Navbar.tsx` (Dinamis)
*   Sebelum login: Tampilkan tombol **Login**.
*   Setelah login: Tampilkan nama user + badge role (kuning emas) + tombol **Logout**.
*   Link **Dashboard** hanya muncul untuk role `admin` dan `owner`.
*   Menggunakan `useState` + `useEffect` untuk menghindari hydration mismatch.

#### 7.4.4 Proteksi Admin Dashboard
*   Halaman `admin/dashboard/page.tsx` dibungkus `<AuthGuard requireRole="admin_or_owner">`.
*   Label panel dinamis: "Owner Panel" untuk owner, "Admin Panel" untuk admin.
*   Sidebar menampilkan semua 9 laporan yang tersedia.

### 7.5 Database Seeding (Update)
*   Menambahkan user Owner: `owner@saintclaire.com` / `password`.
*   Menjalankan `php artisan migrate:fresh --seed --force` untuk reset bersih.

### 7.6 Akun Login Tersedia

| Role | Email | Password |
|------|-------|----------|
| 👑 Owner | `` | `password` |
| 🔧 Admin | `admin@saintclaire.com` | `password` |
| 🛒 Customer | `customer@gmail.com` | `password` |

---

## 📅 [2026-04-28] - Step 8: Fase 3 — Halaman Frontend Lengkap

### 8.1 Latar Belakang
Fase 3 menyelesaikan semua halaman frontend yang belum diimplementasikan sesuai `instruction.md`: registrasi, detail produk, keranjang, checkout, dan riwayat pesanan.

### 8.2 Halaman Register (`/register`)
*   Status: **Selesai**
*   Deskripsi: Halaman registrasi customer baru dengan form 4 field (Nama, Email, Password, Konfirmasi Password).
*   Fitur: Validasi client-side, POST `/api/register` → auto-login → redirect homepage. Link dari halaman login sudah terhubung.

### 8.3 Halaman Detail Produk (`/products/[id]`)
*   Status: **Selesai**
*   Deskripsi: Implementasi fitur **"Dokumentasi Produk Transparan"** dari `instruction.md`.
*   Fitur:
    *   **Full Ingredient List**: Seluruh bahan aktif + deskripsi masing-masing.
    *   **Data Teknis**: pH Level, Tekstur, Stok, SKU produk.
    *   **Breadcrumb Navigation**: Home → Kategori → Produk.
    *   **Add to Cart** dengan quantity control + feedback pesan sukses/gagal.
    *   Badge "Low Stock" jika stok ≤ threshold.
*   Bug Fix: `params` di Next.js 15+ bersifat `Promise` — diperbaiki dengan `React.use(params)`.

### 8.4 Halaman Keranjang (`/cart`)
*   Status: **Selesai**
*   Deskripsi: Implementasi **Persistent Cart** — tersinkronisasi dengan database PostgreSQL.
*   Fitur: Update qty (PUT), hapus item (DELETE), Order Summary, tombol Checkout.
*   Proteksi: `AuthGuard requireRole="customer"`.

### 8.5 Halaman Checkout (`/checkout`)
*   Status: **Selesai**
*   Deskripsi: Form pengiriman dan konfirmasi pesanan.
*   Fitur: Form alamat, pilih kurir (JNE/TIKI/SiCepat/J&T) + harga & estimasi, ringkasan pembayaran (subtotal + ongkir = total), POST `/api/orders/checkout`.
*   Proteksi: `AuthGuard requireRole="customer"`.

### 8.6 Halaman Riwayat Pesanan (`/orders`)
*   Status: **Selesai**
*   Deskripsi: Daftar semua pesanan customer yang login.
*   Fitur: Status badge berwarna (pending/processing/shipped/completed/cancelled), detail item, tombol Batalkan untuk pesanan pending, banner sukses setelah checkout.
*   Proteksi: `AuthGuard requireRole="customer"`.

### 8.7 Update Navbar & Homepage
*   **Navbar**: Menambahkan link Orders & Cart (customer), badge counter keranjang, tombol Register untuk tamu.
*   **Homepage**: Tombol Add to Cart terhubung API, klik produk → navigasi ke detail, ingredient badges, feedback toast.

### 8.8 Hasil Verifikasi
*   ✅ Register → auto-login → redirect homepage.
*   ✅ Product Detail: ingredient list, pH data, Add to Cart berfungsi.
*   ✅ Cart: item tersimpan di database, update qty & hapus berfungsi.
*   ✅ Checkout: pilih kurir, buat pesanan, redirect ke orders.
*   ✅ Orders: status badge + tombol batalkan berfungsi.
*   ✅ Navbar: badge cart count tampil setelah add to cart.

---

## 📅 [2026-04-28] - Step 9: Role Kasir + Payment Gateway + Shipping

### 9.1 Latar Belakang & Masalah yang Diperbaiki
Terdapat celah logika bisnis: siapa yang **menerima dan memproses pesanan** jika Admin hanya bertugas mengelola produk & melihat laporan? Solusinya adalah menambahkan role **Kasir** sebagai operator harian yang bertugas menerima, memproses, dan mengkonfirmasi pesanan.

Bersamaan dengan itu, fitur **Payment Gateway** (Midtrans) dan **Shipping API** (RajaOngkir) diimplementasikan lengkap dengan fallback statis agar sistem tetap berjalan meski API key pihak ketiga belum dikonfigurasi.

### 9.2 Role Matrix Final (2 Role)

| Fitur | 🔧 Admin | 🛒 Customer |
|-------|:-------:|:----------:|
| 9 Laporan Manajerial | ✅ | ❌ |
| CRUD Produk, Kategori, Ingredient | ✅ | ❌ |
| Lihat Semua Pesanan | ✅ | ❌ |
| Update Status Pesanan | ✅ | ❌ |
| Konfirmasi Pembayaran COD | ✅ | ❌ |
| Cart & Checkout | ❌ | ✅ |
| Pesanan Milik Sendiri | ❌ | ✅ |

### 9.3 Akun Login (2 Role)

| Role | Email | Password |
|------|-------|----------|
| 🔧 Admin | `admin@saintclaire.com` | `password` |
| 🛒 Customer | `customer@gmail.com` | `password` |

---

### 9.4 Backend — Database

#### Migration: `add_payment_shipping_to_orders_table`
Menambahkan kolom-kolom baru ke tabel `orders`:

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `payment_method` | string | `cod` atau `midtrans` |
| `payment_token` | string (nullable) | Midtrans Snap Token |
| `midtrans_transaction_id` | string (nullable) | ID transaksi dari Midtrans |
| `shipping_cost` | decimal | Ongkos kirim dari RajaOngkir |
| `city_origin` | string | Kode kota asal (default: 501 = Jakarta Pusat) |
| `city_destination` | string (nullable) | Kode kota tujuan untuk RajaOngkir |

---

### 9.5 Backend — Controller Baru

#### `KasirController`
*   File: `app/Http/Controllers/Api/KasirController.php`
*   `GET /api/kasir/orders` — Daftar semua pesanan (filter by status)
*   `GET /api/kasir/orders/{id}` — Detail satu pesanan
*   `PUT /api/kasir/orders/{id}/status` — Update status pesanan dengan validasi alur:
    *   `pending` → `processing`
    *   `processing` → `shipped` (+ tracking number opsional)
    *   `shipped` → `completed`

#### `PaymentController`
*   File: `app/Http/Controllers/Api/PaymentController.php`
*   `POST /api/payment/snap-token` *(customer auth)* — Buat Midtrans Snap Token untuk order tertentu. Mengembalikan `configured: false` jika belum dikonfigurasi.
*   `POST /api/payment/webhook` *(public)* — Webhook dari Midtrans. Otomatis update `payment_status` dan `status` pesanan berdasarkan notifikasi.
*   `POST /api/kasir/orders/{id}/cod` *(kasir auth)* — Konfirmasi pembayaran COD diterima → order menjadi `completed` + `payment_status: paid`.

#### `ShippingController`
*   File: `app/Http/Controllers/Api/ShippingController.php`
*   `GET /api/shipping/costs` *(public)* — Hitung ongkir dari RajaOngkir. Params: `destination`, `weight`, `courier`.
*   `GET /api/shipping/cities` *(public)* — Daftar kota untuk dropdown tujuan.
*   **Smart Fallback**: Jika `RAJAONGKIR_API_KEY` belum diisi atau gagal, otomatis kembalikan data statis 5 kurir (JNE/TIKI/POS/SiCepat/J&T) dengan tarif per-kg yang realistis.

---

### 9.6 Backend — Perubahan Lainnya

#### `OrderController::store()` (Update)
*   Validasi tambahan: `payment_method`, `shipping_cost`, `city_destination`.
*   Total harga sekarang = subtotal produk + `shipping_cost`.
*   Menyimpan `payment_method` dan `shipping_cost` ke database.

#### `routes/api.php` (Rewrite)
Penambahan grup route:
```
# Kasir (role:kasir)
GET  /api/kasir/orders
GET  /api/kasir/orders/{id}
PUT  /api/kasir/orders/{id}/status
POST /api/kasir/orders/{id}/cod

# Payment (mix: customer auth & public)
POST /api/payment/snap-token    ← customer auth
POST /api/payment/webhook       ← public (Midtrans server)

# Shipping (public)
GET  /api/shipping/costs
GET  /api/shipping/cities
```

#### `Order` Model (Update)
*   Menambahkan kolom payment dan shipping ke `$fillable`.

#### `UserSeeder` (Update)
*   Menambahkan user Kasir: `kasir@saintclaire.com` / `password`.

#### `.env` (Update)
*   Menambahkan placeholder key yang dapat diubah:
```env
# Ganti dengan key dari https://dashboard.midtrans.com
MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=false

# Ganti dengan key dari https://rajaongkir.com/akun
RAJAONGKIR_API_KEY=YOUR_RAJAONGKIR_API_KEY
RAJAONGKIR_BASE_URL=https://api.rajaongkir.com/starter
RAJAONGKIR_ORIGIN_CITY=501
```

#### Paket Composer Baru
*   `midtrans/midtrans-php ^2.6` — Official Midtrans PHP SDK.

---

### 9.7 Frontend — Halaman & Komponen Baru/Diperbarui

#### [NEW] `/kasir/dashboard`
*   File: `frontend/src/app/kasir/dashboard/page.tsx`
*   Proteksi: `AuthGuard requireRole="kasir"`
*   Fitur:
    *   Sidebar filter by status (Semua / Menunggu / Diproses / Dikirim) + counter badge.
    *   Info user: nama + badge "Kasir" warna biru.
    *   Daftar pesanan: order number, nama customer, tanggal, payment method badge, payment status badge, order status badge.
    *   **Alur proses**: tombol muncul sesuai status (`▶ Proses`, `📦 Kirim + Resi`, `✓ Selesai`).
    *   Input **nomor resi** saat status `processing` → `shipped`.
    *   Tombol **💵 Konfirmasi COD** muncul saat pesanan COD berstatus `shipped` dan belum lunas.

#### [MODIFY] `/checkout`
*   File: `frontend/src/app/checkout/page.tsx`
*   Perubahan besar dari checkout statis menjadi checkout dinamis:
    *   **Step 1**: Form alamat pengiriman.
    *   **Step 2**: Pilih kota tujuan (autocomplete search dari `/api/shipping/cities`) + pilih kurir + tombol **Cek Ongkir** → tampilkan layanan dari `/api/shipping/costs`.
    *   **Step 3**: Pilih metode pembayaran (COD / Midtrans) dengan info panel kontekstual.
    *   Ringkasan: subtotal + ongkir + total.
    *   COD → langsung `POST /api/orders/checkout` → redirect ke `/orders`.
    *   Midtrans → order dibuat → ambil Snap Token → load `snap.js` → popup Midtrans.

#### [MODIFY] `auth.ts`
*   Menambahkan `isKasir()`, `isStaff()`, `getRedirectAfterLogin()`.
*   Update tipe `UserData.role` untuk include `'kasir'`.

#### [MODIFY] `AuthGuard.tsx`
*   Menambahkan support `requireRole="kasir"` dan `requireRole="staff"`.

#### [MODIFY] `Navbar.tsx`
*   Menambahkan link **Kasir Panel** (warna biru) untuk role kasir.
*   Admin/Owner tetap melihat link Dashboard.

---

### 9.8 Alur Bisnis Lengkap (End-to-End)

```
Customer checkout (COD atau Midtrans)
        ↓
  Pesanan masuk → status: pending, payment_status: unpaid
        ↓
  Kasir login → Kasir Dashboard
        ↓
  Klik [▶ Proses] → status: processing
        ↓
  Input No. Resi → Klik [📦 Kirim] → status: shipped
        ↓
  COD:  Klik [💵 Konfirmasi COD] → payment_status: paid → status: completed
  Midtrans: Webhook otomatis update → payment_status: paid
        ↓
  Customer melihat di /orders → status: ✅ Selesai
```

### 9.9 Hasil Verifikasi
*   ✅ 8 route baru terdaftar (kasir: 4, payment: 2, shipping: 2).
*   ✅ Migration berhasil: kolom payment & shipping ditambahkan ke tabel `orders`.
*   ✅ User Kasir berhasil dibuat di database.
*   ✅ Midtrans SDK (`midtrans/midtrans-php ^2.6`) terinstall.
*   ✅ Checkout: RajaOngkir fallback statis berjalan tanpa API key.
*   ✅ Kasir Dashboard: filter status, update status berfungsi.

---

## 📅 [2026-05-05] - Step 10: Reporting Engine Overhaul & PDF Export

### 10.1 Refactoring PDF Generation (FPDF)
*   **Structured Layout**: Implemented specific column configurations for all 9 report types, replacing the previous generic table generator.
*   **Professional Branding**:
    *   Integrated company logo with automatic type detection (fixing a bug where JPEG files named `.png` caused crashes).
    *   Added professional headers with report titles and decorative separators.
    *   Added footers with page numbering and print timestamps.
*   **Data Formatting**:
    *   Implementation of `getNestedValue` helper to handle dot-notation keys (e.g., `user.name`).
    *   Currency formatting for financial data (Rp).
    *   Datetime formatting for transaction logs.
    *   Percentage calculation for profit/loss margins.

### 10.2 Bug Fixes & Resilience
*   **Image Parsing Fix**: Updated `ReportController` to detect image magic bytes (`FFD8` for JPG vs `89PNG`) to prevent FPDF errors when file extensions don't match actual content.
*   **Error Handling**: Wrapped PDF image processing in try-catch blocks to ensure reports generate even if assets are missing or corrupted.

---

## 📅 [2026-05-05] - Step 11: Owner Experience & Login Refinement

### 11.1 Role-Based Login Redirection
*   **Automatic Login Fix**: Removed hardcoded redirection logic from the login page.
*   **Centralized Routing**: Integrated `getRedirectAfterLogin()` helper to ensure users are sent to the correct dashboard (Kasir vs Admin/Owner) segera setelah autentikasi.

### 11.2 Premium Owner Dashboard UI
*   **Executive Strategy Center**: Desain ulang admin dashboard dengan estetika premium (Stone & Primary color palette).
*   **Summary Statistics (KPIs)**:
    *   **Revenue Growth**: Kalkulasi real-time total penjualan.
    *   **Total Operations**: Counter untuk pesanan aktif.
    *   **Customer Base**: Tracking jumlah member eksklusif.
*   **Enhanced Navigation**:
    *   Sidebar modern dengan ikon kontekstual untuk setiap jenis laporan.
    *   Peningkatan UI tabel dengan ID padding, monospaced numbers, dan hover effects.
    *   Labeling dinamis ("Owner Strategy Center" vs "Administrative Access").
*   **Utility Improvements**:
    *   Implementasi fungsi Logout yang membersihkan sesi secara menyeluruh.
    *   Penyempurnaan Search dan Export PDF buttons dengan feedback visual loading.
    *   Memperbaiki bug `useRouter` yang tidak terdefinisi pada dashboard.

---

## 📅 [2026-05-05] - Step 12: Customer Invoices & Order Management

### 12.1 Digital Invoice Generation
*   **Branded Invoices**: Implementasi sistem ekspor invoice PDF otomatis untuk setiap pesanan.
*   **Professional Template**:
    *   Header: Logo Saint Claire Beauty + Order Metadata.
    *   Billing Info: Data customer & alamat pengiriman.
    *   Itemized Table: Deskripsi produk, qty, harga satuan, dan subtotal.
    *   Financial Summary: Perhitungan otomatis Subtotal, Ongkos Kirim (berdasarkan kurir), dan Total Akhir.
*   **Access Control**: Endpoint invoice diproteksi agar hanya dapat diakses oleh pemilik pesanan, admin, atau owner.

### 12.2 Dashboard Integrations
*   **My Orders (Frontend)**: Menambahkan tombol "📄 Invoice" pada setiap kartu pesanan pelanggan untuk akses cepat ke bukti transaksi.
*   **Kasir Panel**: Menambahkan akses invoice pada panel kasir untuk memudahkan operasional saat pengepakan atau konfirmasi pengiriman.
*   **Visual Feedback**: Implementasi micro-loading state pada tombol download untuk memberikan feedback instan saat PDF sedang diproses.

---

## 📅 [2026-05-05] - Step 13: Dashboard UI Responsiveness Fix

### 13.1 Mobile Layout Support
*   **Responsive Sidebar**: Implementasi sidebar yang dapat disembunyikan (*collapsible*) pada layar mobile menggunakan `isMobileMenuOpen` state dan Tailwind transition.
*   **Hamburger Menu**: Penambahan tombol menu hamburger pada header mobile untuk memudahkan navigasi.
*   **Interactive Overlay**: Penambahan overlay gelap di belakang sidebar mobile untuk fokus visual dan kemudahan menutup menu.

### 13.2 Layout Restructuring
*   **Fluid Containers**: Mengganti margin fixed `ml-72` menjadi dinamis (`ml-0 lg:ml-72`) dan menyesuaikan padding untuk layar kecil.
*   **Adaptive Grid**: Mengubah grid kartu ringkasan eksekutif dari 3-kolom menjadi responsif (1 kolom di mobile, 2 di tablet, 3 di desktop).
*   **Form Flexibility**: Search bar dan tombol export kini menyesuaikan lebar layar secara otomatis, beralih ke layout vertikal pada perangkat sangat kecil.
*   **Table Optimization**: Memastikan kontainer tabel memiliki scroll horizontal yang aman untuk mencegah layout pecah saat menampilkan data luas.

### 13.3 Navigation Experience
*   **Auto-Close Logic**: Sidebar mobile otomatis menutup setelah item laporan dipilih untuk memberikan ruang pandang maksimal pada data yang diminta.
*   **Visual Refinement**: Penyesuaian ukuran font header dan jarak antar elemen agar tetap proporsional di berbagai ukuran layar.
