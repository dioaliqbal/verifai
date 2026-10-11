# Verifai — Detektor Gambar AI & Human

Aplikasi web untuk mendeteksi apakah sebuah gambar dibuat oleh AI atau manusia, lengkap dengan riwayat scan dan insight. Deteksi memakai [Sightengine](https://sightengine.com).

## Menjalankan secara lokal

Prasyarat: Node.js 20+

1. Install dependency:
   `npm install`
2. Salin `.env.example` menjadi `.env`, lalu isi `SIGHTENGINE_API_USER` dan `SIGHTENGINE_API_SECRET`.
3. Jalankan mode development:
   `npm run dev`

## Production

```
npm run build
npm start
```
