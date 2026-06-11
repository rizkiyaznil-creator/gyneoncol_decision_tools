# GynOnco Decision Tools

> Alat bantu keputusan klinis untuk **spesialis ginekologi onkologi** — informasi stadium FIGO/WHO terkini dan perangkat pendukung keputusan (kalkulator dosis kemoterapi, algoritma terapi adjuvant) untuk tujuh keganasan ginekologi.

⚠️ **Disclaimer:** Aplikasi ini adalah **alat bantu edukasi**, **bukan pengganti** penilaian klinis, pemeriksaan langsung, maupun diskusi tumor board. Verifikasi setiap keluaran terhadap guideline primer terbaru dan kondisi pasien.

---

## ✨ Fitur (v0.1.0 — kerangka awal)

- **Landing page** dengan tujuh modul kanker ginekologi:
  ovarium, serviks, endometrium, vulva, penyakit trofoblas maligna (GTN), vagina, sarkoma uteri.
- Tiap modul memuat:
  - **Stadium FIGO/WHO** terkini (dengan label versi + referensi):
    FIGO 2014 (ovarium), 2018 (serviks), **2023 (endometrium)**, 2021 (vulva), 2009 (sarkoma), staging anatomik GTN, dll.
  - **Histologi & catatan klinis** (klasifikasi WHO, penanda molekuler).
  - **Alat bantu keputusan** yang relevan.
- **Alat yang sudah berfungsi:**
  | Alat | Kegunaan |
  |---|---|
  | Kalkulator BSA | Mosteller & DuBois |
  | Dosis Carboplatin (Calvert) | AUC × (GFR + 25), GFR via Cockcroft–Gault atau terukur |
  | Dosis berbasis BSA (Cisplatin) | Praset mingguan/3-mingguan + cap dosis |
  | Algoritma adjuvant ovarium | Saran terapi berdasar stadium/histologi/BRCA-HRD |
  | Algoritma adjuvant serviks | Kriteria Peters (kemoradiasi) & Sedlis (radioterapi pelvis) pasca-histerektomi radikal |
  | Kelas molekuler & risiko endometrium | Kerangka ESGO/ESMO/ESTRO/ESP 2020 |
  | Skor prognostik GTN (WHO/FIGO) | Risiko rendah vs tinggi → pemilihan regimen |

- **Bahasa Indonesia**, istilah medis dipertahankan.
- **Tanpa build step**, tanpa dependensi runtime, jalan sepenuhnya di peramban. Tidak mengirim/menyimpan data pasien.

## 🧭 Menjalankan secara lokal

Aplikasi memakai ES modules, jadi perlu **disajikan lewat HTTP** (bukan dibuka langsung sebagai `file://`). Pilih salah satu:

```bash
# Python (umumnya sudah terpasang)
python3 -m http.server 8000
# lalu buka http://localhost:8000

# atau Node
npx serve .
```

## 🚀 Deploy ke GitHub Pages

**Cara mudah (tanpa Actions):**
1. Settings → Pages → **Source: Deploy from a branch**.
2. Pilih branch (mis. `main`) dan folder **/(root)**, simpan.
3. Situs terbit di `https://<user>.github.io/gyneoncol_decision_tools/`.

**Otomatis (Actions):** tersedia workflow di `.github/workflows/deploy-pages.yml` (Source: GitHub Actions).

## 🗂️ Struktur proyek

```
index.html                # shell aplikasi (header, banner disclaimer, footer)
styles/main.css           # styling responsif
src/
  app.js                  # bootstrap + hash router
  utils/dom.js            # helper DOM minimal (h, mount, clear, route)
  data/
    cancers.js            # registry kanker
    ovarium.js … sarkoma.js   # data tiap kanker (stadium, histologi, referensi)
  tools/
    registry.js           # registry alat
    shared.js             # helper form/hasil
    chemoDosing.js … gtnScore.js  # modul alat
  components/             # halaman (home, cancerPage, toolPage, dst.)
scripts/validate.mjs      # uji integritas modul (node scripts/validate.mjs)
```

## 🧩 Mengembangkan (modular by design)

**Menambah kanker baru**
1. Buat `src/data/<kanker>.js` (ikuti pola file kanker yang ada).
2. `import` dan tambahkan ke array di `src/data/cancers.js`.

**Menambah alat baru**
1. Buat `src/tools/<alat>.js` dengan `export default { id, name, short, category, render(container) }`.
2. `import` dan daftarkan di `src/tools/registry.js`.
3. Cantumkan `id`-nya pada array `tools` di file kanker terkait (opsional).

**Uji cepat:** `node scripts/validate.mjs`

## 📚 Sumber guideline

FIGO · NCCN · ESGO/ESMO/ESTRO/ESP · WHO Classification of Tumours (Female Genital Tumours, 5th ed., 2020). Versi dapat berubah — selalu cek edisi terkini. Referensi spesifik tercantum di tiap modul.

## 🛣️ Rencana pengembangan

- ~~Algoritma adjuvant untuk serviks (kriteria Sedlis/Peters)~~ → selesai. Berikutnya: algoritma adjuvant vulva dan sarkoma.
- ~~Regimen serviks (GOG-240/JCOG0505/KEYNOTE-826) & GTN (EMA-CO/EMA-EP, metotreksat–folinat)~~ → sudah ditambahkan ke kalkulator dosis. Berikutnya: AUC paklitaksel & dosis berbasis berat ideal/disesuaikan.
- Mode dwibahasa & ekspor ringkasan keputusan (PDF/print).
- Penautan referensi (DOI/PubMed) langsung di tiap pernyataan.

---
*Untuk penggunaan oleh tenaga medis profesional. Bukan nasihat medis untuk pasien.*
