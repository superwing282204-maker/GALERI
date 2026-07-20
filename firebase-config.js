// =========================================================
// KONFIGURASI FIREBASE — WAJIB DIISI SEBELUM DIPAKAI
// =========================================================
//
// Galeri ini pakai Firebase (gratis) supaya foto/video yang
// diupload satu orang langsung muncul real-time di layar
// semua teman sekelas lain, tanpa perlu refresh.
//
// CARA SETUP (sekitar 5 menit, gratis, tidak perlu kartu kredit):
//
// 1. Buka https://console.firebase.google.com dan login pakai akun Google.
// 2. Klik "Add project" → beri nama misalnya "galeri-tkj1" → lanjut sampai selesai.
// 3. Di sidebar kiri project, klik "Databases & Storage" → "Firestore" →
//    "Create database" → pilih lokasi (misalnya asia-southeast) →
//    mulai dalam "test mode" dulu (nanti rules-nya kita ganti, lihat bawah).
//    (Firebase Storage TIDAK dipakai di versi ini — file foto/video
//    disimpan lewat Cloudinary yang gratis tanpa kartu, lihat
//    cloudinary-config.js.)
// 4. Klik ikon gerigi (Project settings) di pojok kiri atas →
//    scroll ke bagian "Your apps" → klik ikon "</>" (Web) →
//    beri nama app → daftar → Firebase akan menampilkan objek
//    firebaseConfig seperti di bawah ini. Copy nilai-nilainya
//    ke sini, GANTI semua tulisan "GANTI_..." di bawah.
//
// 5. PENTING — Atur Security Rules Firestore supaya papan hanya bisa
//    dipakai dengan wajar (siapa saja boleh baca & upload data, tapi
//    tidak bisa mengubah/menghapus data orang lain):
//
//    Firestore Rules (tab "Rules" di Firestore Database):
//    ------------------------------------------------------
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /gallery/{itemId} {
//          allow read: if true;
//          allow create: if request.resource.data.keys().hasAll(['url','type','nama','caption','createdAt'])
//                        && request.resource.data.nama is string
//                        && request.resource.data.nama.size() < 60
//                        && request.resource.data.caption.size() < 200;
//          allow update, delete: if false;
//        }
//      }
//    }
//
//    (Rules di atas membuka tambah-data untuk siapa saja yang punya
//    link situsnya — cocok untuk galeri kelas. Tidak ada login/password.
//    Kalau nanti mau dibatasi hanya anak kelas, bisa ditambah Firebase
//    Authentication — tinggal bilang, nanti dibantu.)
//
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1fsBd-Y8snWJkUqzAL1a3lt8aYfjcgUE",
  authDomain: "galeri-tkj1-imelda.firebaseapp.com",
  projectId: "galeri-tkj1-imelda",
  storageBucket: "galeri-tkj1-imelda.firebasestorage.app",
  messagingSenderId: "379761942152",
  appId: "1:379761942152:web:7b4fcb8a4736437539093d"
};

export const firebaseApp = initializeApp(firebaseConfig);
