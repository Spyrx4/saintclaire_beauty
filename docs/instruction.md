# 💄 E-Commerce Produk Kecantikan Eksklusif

Platform e-commerce mandiri yang dirancang khusus untuk *skincare enthusiast*. Sistem ini menolak algoritma rekomendasi konvensional dan beralih pada **transparansi data teknis**, **kecepatan transaksi (One-Click)**, dan **manajemen keranjang lintas perangkat**. Tujuan utama proyek ini adalah menekan biaya potongan *marketplace* pihak ketiga sekaligus memberikan pengalaman belanja premium bagi klien cerdas.

---

## ✨ Fitur Utama (Core Features)

1. **Pencarian & Filter Teknis Lanjutan:** Pengguna dapat menyaring produk berdasarkan data spesifik seperti Bahan Aktif (Retinol, Vitamin C), Tekstur, dan Rentang *pH Level*.
2. **Dokumentasi Produk Transparan:** Menampilkan *Full Ingredient List* dan panduan penggunaan langkah demi langkah yang detail.
3. **Persistent Cart (Keranjang Tetap):** Data keranjang belanja disinkronisasi di *Cloud* database, memungkinkan pengguna melanjutkan proses belanja di perangkat berbeda tanpa kehilangan data.
4. **One-Click Checkout:** Eksekusi transaksi kilat yang menggunakan data alamat *default* dan *tokenized payment gateway* secara aman.
5. **Advanced Analytics & Reporting:** Menghasilkan 11 laporan manajerial mendalam termasuk Analisis Bahan Aktif (Preskriptif), Laba Rugi, dan Manajemen Stok Kritis.

---

## 🛠️ Rekomendasi Tech Stack

Untuk mengeksekusi rancangan arsitektur ini secara optimal, direkomendasikan menggunakan teknologi berikut:

* **Frontend:** Next.js (React) atau Vue.js — *Sangat cocok untuk membangun UI filter yang reaktif dan pengalaman One-Click Checkout yang mulus tanpa reload halaman.*
* **Backend:** Node.js (Express/NestJS) atau PHP (Laravel) — *Untuk menangani logika REST API yang cepat dan integrasi Webhook dari pihak ketiga.*
* **Database:** PostgreSQL — *Relasional database yang tangguh, sangat direkomendasikan untuk mengelola query analitik kompleks pada 11 jenis laporan.*
* **Payment Gateway:** Midtrans / Xendit — *Untuk fitur tokenisasi kartu/e-wallet (One-Click Checkout).*
* **Logistic API:** RajaOngkir / Biteship — *Untuk perhitungan ongkos kirim otomatis.*

---

## 📂 Struktur Dokumen Sistem (UML & UI)

Pengembangan sistem wajib mengacu pada dokumen rancangan yang telah disetujui:
* **UI/UX Mockups:** Tampilan Utama, Filter Teknis, Detail Produk, Keranjang, Checkout, dan Dashboard Admin.
* **Database (ERD):** Relasi antar entitas `User`, `Product`, `Transaction`, `Cart`, dan `Activity_Log`.
* **Class Diagram:** Definisi metode operasional seperti `execute_one_click()` dan `sync_data()`.
* **Sequence & Activity Diagram:** Alur sistem dari pencarian produk hingga validasi pembayaran.

---

## 🚀 Fase Pengembangan (Execution Roadmap)

Proyek ini direkomendasikan untuk dieksekusi dalam 4 fase (*Sprint*):

### Fase 1: Setup Database & Backend Core
* Konfigurasi repositori dan *environment* proyek.
* Migrasi struktur *database* (Tabel User, Product, Inventory, dll) sesuai ERD.
* Pembuatan skema data untuk *Active Ingredients*, *pH Level*, dan *Texture*.
* Pembuatan API CRUD dasar untuk produk dan manajemen *user* (Admin).

### Fase 2: Sistem Transaksi & Integrasi Pihak Ke-3
* Pembuatan API Keranjang Belanja (*Persistent Cart*).
* Integrasi Logistic API untuk cek resi dan ongkos kirim.
* Integrasi *Payment Gateway* dan pengujian sistem tokenisasi keamanan untuk One-Click Checkout.
* Pembuatan *Webhook* untuk mendengarkan status pembayaran (Berhasil/Gagal/Pending).

### Fase 3: Frontend & User Interface
* Slicing UI dari desain *mockup* ke kode HTML/CSS/Framework.
* Implementasi sistem *Advanced Technical Filter* yang terhubung ke Backend API.
* Integrasi halaman detail produk, keranjang, dan modul *checkout*.
* Pengujian lintas perangkat (*responsive design*).

### Fase 4: Modul Pelaporan & Finalisasi
* Pembuatan *Query Builder* untuk menghasilkan 11 Laporan Manajerial.
* Pembuatan tampilan PDF / Excel *export* untuk:
  1. Laporan Penjualan Bulanan
  2. Laporan Inventaris Barang
  3. Laporan Produk Terlaris (Fast Moving)
  4. Laporan Data Pelanggan Eksklusif
  5. Laporan Stok Kritis
  6. Faktur Penjualan (Invoice)
  7. Surat Jalan / Packing Slip
  8. Laporan Transaksi Dibatalkan
  9. Laporan Laba Rugi Produk
  10. Log Aktivitas Admin (Audit Trail)
  11. Laporan Analisis Bahan Aktif (Preskriptif)
* UAT (*User Acceptance Testing*) menyeluruh.
* Produksi dan *Deployment* ke server.

---

## 🔐 Keamanan & Privasi

* Semua *password* pengguna wajib di- *hash* menggunakan algoritma *Bcrypt* atau *Argon2*.
* Data pembayaran/kartu **TIDAK DISIMPAN** di server lokal, melainkan menggunakan sistem *Tokenization* standar PCI-DSS dari penyedia *Payment Gateway*.
* API dilindungi oleh autentikasi berbasis JWT (*JSON Web Token*).