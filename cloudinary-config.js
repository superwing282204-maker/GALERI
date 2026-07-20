// =========================================================
// KONFIGURASI CLOUDINARY — untuk menyimpan file foto/video
// (gratis, TIDAK perlu kartu kredit/debit)
// =========================================================
//
// CARA SETUP (sekitar 3 menit):
//
// 1. Buka https://cloudinary.com/users/register/free dan daftar
//    pakai email (tidak diminta kartu sama sekali untuk paket gratis).
// 2. Setelah login, kamu akan lihat dashboard dengan tulisan
//    "Cloud name" di bagian atas — copy nilai itu ke CLOUD_NAME di bawah.
// 3. Di kolom pencarian dashboard, ketik "Upload presets" lalu buka
//    halaman itu (atau: Settings → Upload → Upload presets).
// 4. Klik "Add upload preset":
//      - Signing Mode: pilih "Unsigned"  (WAJIB, ini yang bikin bisa
//        upload langsung dari browser tanpa server sendiri)
//      - Folder: boleh isi "gallery" (opsional, sudah diatur juga dari kode)
//      - Simpan / Save
// 5. Copy nama preset yang baru dibuat (contoh: "unsigned_abc123")
//    ke UPLOAD_PRESET di bawah.
//
// Paket gratis Cloudinary: 25GB penyimpanan + 25GB bandwidth/bulan —
// jauh lebih dari cukup untuk galeri satu kelas.
// =========================================================

export const CLOUDINARY_CLOUD_NAME = "cvnrvfa2";
export const CLOUDINARY_UPLOAD_PRESET = "tkj_arsip";
