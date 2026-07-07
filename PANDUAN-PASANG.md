# EMIS Kedah — Pusat Rujukan Guru Data (PWA)

Hub rujukan + penjejak Surat Lantikan untuk Guru Data sekolah negeri Kedah.
Frontend: PWA statik (GitHub Pages). Backend: Google Apps Script + Google Sheets.

## Struktur fail

```
index.html              ← app utama (PWA)
mdv-data.js             ← data Kamus Definisi Variabel (dimuatkan oleh index.html)
manifest.webmanifest    ← manifes PWA
sw.js                   ← service worker (offline untuk rujukan)
icons/                  ← logo & ikon PWA (192/512 + maskable)
backend/Code.gs         ← backend Google Apps Script
PANDUAN-PASANG.md        ← fail ini
```

---

## Bahagian A — Backend (Google Apps Script + Sheets)

1. Buka **Google Sheet baharu** → namakan cth. *EMIS Kedah — Guru Data Hub*.
2. **Extensions → Apps Script**. Padamkan kod contoh, tampal keseluruhan `backend/Code.gs`. Simpan.
3. Pilih fungsi **`setup`** → **Run**. Benarkan kebenaran bila diminta.
   - Ini mencipta semua tab dan **akaun admin lalai: `admin` / `admin`** (tukar segera selepas log masuk pertama).
4. **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   - Deploy → salin **URL Web app** (berakhir dengan `/exec`).
5. Buka `index.html`, cari baris:
   ```js
   const API = 'PASTE_GAS_WEB_APP_URL_HERE';
   ```
   Gantikan dengan URL `/exec` tadi. Simpan.

> Setiap kali `Code.gs` dikemas kini, **Deploy → Manage deployments → Edit → New version** supaya perubahan berkuat kuasa.

### Skema tab Sheet

| Tab | Lajur | Catatan |
|-----|-------|---------|
| **Sekolah** | KodSekolah, NamaSekolah, KodPPD, NamaPPD | **Anda isi** — senarai semua sekolah Kedah |
| **PPD** | KodPPD, NamaPPD, PinHash, MestiTukar | Isi KodPPD + NamaPPD; biar PinHash kosong (PIN lalai = KodPPD) |
| **Admin** | Username, PinHash, MestiTukar | Dicipta auto oleh `setup()` |
| **Akaun** | KodSekolah, PinHash, MestiTukar, TarikhDaftar, LogMasukAkhir | **Auto** — dicipta bila Guru Data log masuk kali pertama |
| **Lantikan** | KodSekolah, NamaSekolah, KodPPD, NamaPPD, Nama, KP, Gred, Tarikh, Ada, NoSurat, Status, Catatan, AdminCatatan, TarikhKemas | **Auto** — diisi bila Guru Data hantar |

### Data yang anda perlu sediakan (satu kebergantungan)

Tampal senarai sekolah ke tab **Sekolah** (KodSekolah, NamaSekolah, KodPPD, NamaPPD).
Ini boleh diambil dari data MAP/EMIS Kedah sedia ada. Tanpa senarai ini, Guru Data tidak boleh log masuk (kod disemak terhadap tab ini). Padamkan baris contoh selepas isi data sebenar.

---

## Bahagian B — Frontend (GitHub Pages)

1. Muat naik semua fail (index.html, mdv-data.js, manifest.webmanifest, sw.js, folder `icons/`) ke repo GitHub.
2. **Settings → Pages → Deploy from branch** (cth. `main` / root).
3. Buka URL yang diberi. Untuk PWA, wajib **HTTPS** — GitHub Pages sudah HTTPS.
4. Di telefon: buka di Chrome/Safari → **Add to Home Screen** untuk pasang sebagai app.

> **Penting:** setiap kali `index.html` atau `mdv-data.js` dikemas kini, naikkan nombor `CACHE` dalam `sw.js` (cth. `emis-kedah-v3` → `v4`) supaya pengguna dapat versi terbaharu.

---

## Peranan & akaun

| Peranan | Log masuk | PIN pertama |
|---------|-----------|-------------|
| **Guru Data** | Kod Sekolah | = Kod Sekolah (wajib tukar) |
| **Pegawai PPD** | Kod PPD | = Kod PPD (wajib tukar) |
| **Admin JPN** | `admin` | `admin` (wajib tukar) |

- **Guru Data:** rujukan penuh + borang & status Surat Lantikan sendiri.
- **PPD:** pantau sekolah dalam daerahnya (paparan sahaja; No. KP disembunyikan).
- **Admin JPN:** dashboard seluruh negeri, kemas kini status, eksport CSV.

## Aliran Surat Lantikan

Guru Data isi borang → **Menunggu Semakan** → Admin JPN semak & tukar status
(*Sedang Diproses → Selesai*) → Admin sedia surat secara manual → status *Selesai*.
Guru Data & PPD nampak status terkini pada bila-bila masa.

## Nota keselamatan & privasi

- Gerbang PIN ini sesuai untuk alat dalaman; PIN disimpan sebagai **hash SHA-256** (bukan teks biasa), token bertanda **HMAC** (tempoh 12 jam).
- Tab **Lantikan** mengandungi **No. KP** (data peribadi, Akta 709). Hadkan akses Sheet kepada pegawai bertanggungjawab sahaja; PPD tidak melihat No. KP dalam app.
- Untuk keselamatan lebih tinggi pada masa depan: pertimbangkan Google Sign-In domain rasmi.
