# 📦 Stokify – Aplikasi Inventaris UMKM

Stokify adalah aplikasi inventaris sederhana untuk UMKM makanan, membantu tracking bahan baku, produk jadi, dan transaksi keuangan. Dibangun menggunakan **React + Vite + Tailwind** serta mendukung **PWA**, sehingga tetap dapat dibuka meski tanpa internet.

---

## Cara Menjalankan

### 1. Instal dependensi

```bash
npm install
```

### 2. Mode development

```bash
npm run dev
```

### 3. Build untuk produksi

```bash
npm run build
npx serve dist
```

---

## Fitur Utama

### • Manajemen Bahan Baku

Melihat daftar bahan, stok, satuan, harga rata-rata, dan supplier.

### • Manajemen Produk

Melihat stok produk, harga, dan resep bila tersedia.

### • Keuangan UMKM

Mencatat pemasukan, pengeluaran, kategori transaksi, serta ringkasan harian & bulanan.

### • Mode Offline (PWA)

Aplikasi tetap bisa dibuka meskipun tidak ada internet:

- Data terakhir disimpan otomatis di `localStorage`.
- CRUD diblokir saat offline (hanya bisa lihat data).
- Saat online kembali, data akan tersinkron otomatis.

### • Instal Seperti Aplikasi HP

Dapat dipasang di Android/iOS/Desktop melalui fitur **“Add to Home Screen”**.

---

## Cara Menguji Mode Offline PWA

1. Jalankan build:
   ```bash
   npm run build
   npx serve dist
   ```
2. Akses aplikasi di browser.
3. Buka DevTools → Network → set "Offline".
4. Refresh halaman untuk memastikan:
   - UI tetap tampil.
   - Data terakhir muncul dari local cache.

---

## Catatan Tambahan

- Aplikasi hanya menyimpan data offline **terakhir yang berhasil di-fetch**.
- CRUD memerlukan koneksi internet karena menggunakan Supabase sebagai backend.

---

Terima kasih telah menggunakan **Stokify** 🎉  
Aplikasi inventaris UMKM yang ringan, cepat, dan bisa offline.
