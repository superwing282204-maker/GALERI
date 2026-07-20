// =========================================================
// Papan Kenangan TKJ 1 — logic upload + realtime sync
// =========================================================

import { firebaseApp } from "./firebase-config.js";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./cloudinary-config.js";
import {
  getFirestore, collection, addDoc, onSnapshot,
  query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(firebaseApp);

const MAX_IMAGE_MB = 8;
const MAX_VIDEO_MB = 60;

// ---------- element refs ----------
const form = document.getElementById("upload-form");
const namaInput = document.getElementById("nama");
const captionInput = document.getElementById("caption");
const fileInput = document.getElementById("file-input");
const dropzone = document.getElementById("dropzone");
const dropzoneInner = document.getElementById("dropzone-inner");
const dropzonePreview = document.getElementById("dropzone-preview");
const submitBtn = document.getElementById("submit-btn");
const progressWrap = document.getElementById("progress");
const progressBar = document.getElementById("progress-bar");
const progressLabel = document.getElementById("progress-label");
const formMsg = document.getElementById("form-msg");

const grid = document.getElementById("gallery-grid");
const boardEmpty = document.getElementById("board-empty");
const statCount = document.getElementById("stat-count");
const statLive = document.getElementById("stat-live");

const lightbox = document.getElementById("lightbox");
const lightboxStage = document.getElementById("lightbox-stage");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");

// ---------- preview file yang dipilih ----------
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const isVideo = file.type.startsWith("video/");
  const url = URL.createObjectURL(file);

  dropzoneInner.hidden = true;
  dropzonePreview.hidden = false;
  dropzonePreview.innerHTML = "";

  const el = document.createElement(isVideo ? "video" : "img");
  el.src = url;
  if (isVideo) { el.controls = true; el.muted = true; }
  dropzonePreview.appendChild(el);
});

["dragover", "dragleave", "drop"].forEach(evt => {
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    dropzone.classList.toggle("is-dragover", evt === "dragover");
  });
});

// ---------- submit / upload ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.textContent = "";
  formMsg.className = "form-msg";

  const file = fileInput.files[0];
  const nama = namaInput.value.trim();
  const caption = captionInput.value.trim();

  if (!file) {
    showError("Pilih dulu foto atau videonya, ya.");
    return;
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) {
    showError("File harus berupa gambar atau video.");
    return;
  }

  const sizeMB = file.size / (1024 * 1024);
  if (isImage && sizeMB > MAX_IMAGE_MB) {
    showError(`Gambar terlalu besar (maks. ${MAX_IMAGE_MB}MB).`);
    return;
  }
  if (isVideo && sizeMB > MAX_VIDEO_MB) {
    showError(`Video terlalu besar (maks. ${MAX_VIDEO_MB}MB).`);
    return;
  }

  setUploading(true);

  try {
    const url = await uploadToCloudinary(file, (pct) => {
      progressBar.style.width = pct + "%";
      progressLabel.textContent = `Mengunggah… ${pct}%`;
    });

    await addDoc(collection(db, "gallery"), {
      url,
      type: isVideo ? "video" : "image",
      nama: nama || "Anonim",
      caption: caption || "",
      createdAt: serverTimestamp()
    });

    showSuccess("Berhasil ditempel ke papan!");
    form.reset();
    dropzoneInner.hidden = false;
    dropzonePreview.hidden = true;
    dropzonePreview.innerHTML = "";
  } catch (err) {
    console.error(err);
    showError("Gagal mengunggah. Cek koneksi internet lalu coba lagi.");
  } finally {
    setUploading(false);
  }
});

// ---------- upload file ke Cloudinary (gratis, tanpa kartu) ----------
function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "gallery");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url);
      } else {
        reject(new Error("Cloudinary upload failed: " + xhr.status));
      }
    };
    xhr.onerror = () => reject(new Error("Network error saat upload"));
    xhr.send(formData);
  });
}

function setUploading(isUploading) {
  submitBtn.disabled = isUploading;
  progressWrap.hidden = !isUploading;
  if (isUploading) {
    progressBar.style.width = "0%";
    progressLabel.textContent = "Mengunggah… 0%";
  }
}

function showError(msg) {
  formMsg.textContent = msg;
  formMsg.className = "form-msg is-error";
}
function showSuccess(msg) {
  formMsg.textContent = msg;
  formMsg.className = "form-msg is-success";
}

// ---------- realtime render ----------
const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  statLive.style.background = "#3ecf6a";

  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  statCount.textContent = items.length;
  boardEmpty.classList.toggle("is-visible", items.length === 0);

  grid.innerHTML = "";
  items.forEach(item => grid.appendChild(renderCard(item)));
}, (err) => {
  console.error(err);
  statLive.style.background = "#c81e3a";
  boardEmpty.classList.add("is-visible");
  boardEmpty.querySelector("p").textContent =
    "Tidak bisa terhubung ke papan. Cek konfigurasi Firebase di firebase-config.js.";
});

function renderCard(item) {
  const card = document.createElement("article");
  card.className = "memory-card";

  const tape = document.createElement("div");
  tape.className = "memory-card__tape";
  card.appendChild(tape);

  const media = document.createElement("div");
  media.className = "memory-card__media";
  media.appendChild(buildMediaEl(item, false));

  if (item.type === "video") {
    const badge = document.createElement("span");
    badge.className = "video-badge";
    badge.innerHTML = '<i class="fa-solid fa-play"></i> video';
    media.appendChild(badge); // harus di dalam .memory-card__media, sesuai selector CSS
  }

  media.addEventListener("click", () => openLightbox(item));
  card.appendChild(media);

  if (item.caption) {
    const cap = document.createElement("p");
    cap.className = "memory-card__caption";
    cap.textContent = item.caption;
    card.appendChild(cap);
  }

  const meta = document.createElement("div");
  meta.className = "memory-card__meta";
  const when = item.createdAt?.toDate ? formatDate(item.createdAt.toDate()) : "baru saja";
  meta.innerHTML = `<strong>${escapeHtml(item.nama || "Anonim")}</strong><span>${when}</span>`;
  card.appendChild(meta);

  return card;
}

function buildMediaEl(item, isLightbox) {
  if (item.type === "video") {
    const v = document.createElement("video");
    v.src = item.url;
    v.controls = isLightbox;
    v.muted = !isLightbox;
    v.playsInline = true;
    if (!isLightbox) v.loop = true;
    return v;
  }
  const img = document.createElement("img");
  img.src = item.url;
  img.loading = "lazy";
  img.alt = item.caption || `Kenangan dari ${item.nama || "teman sekelas"}`;
  return img;
}

function formatDate(date) {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ---------- lightbox ----------
function openLightbox(item) {
  lightboxStage.innerHTML = "";
  lightboxStage.appendChild(buildMediaEl(item, true));
  lightboxCaption.textContent = item.caption
    ? `“${item.caption}” — ${item.nama || "Anonim"}`
    : `— ${item.nama || "Anonim"}`;
  lightbox.hidden = false;
}
function closeLightbox() {
  lightbox.hidden = true;
  lightboxStage.innerHTML = "";
}
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });
