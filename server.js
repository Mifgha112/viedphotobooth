import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inisialisasi Database SQLite
const db = new sqlite3.Database('./reservasi.db', (err) => {
    if (err) console.error('Gagal memuat database:', err.message);
    else console.log('Sukses terhubung ke database SQLite.');
});

// Membuat Tabel otomatis jika belum ada
db.run(`CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL,
    package TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT,
    booking_code TEXT NOT NULL
)`);

// 1. API: Tambah Reservasi Baru
app.post('/api/reservations', (req, res) => {
    const { name, whatsapp, email, package: pkg, date, time, notes } = req.body;
    const booking_code = 'VLV-' + Math.floor(1000 + Math.random() * 9000);
    
    const query = `INSERT INTO reservations (name, whatsapp, email, package, date, time, notes, booking_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [name, whatsapp, email, pkg, date, time, notes, booking_code], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, booking_code, name, whatsapp, package: pkg, date, time });
    });
});

// 2. API: Ambil Semua Data Reservasi (Untuk Dashboard)
app.get('/api/reservations', (req, res) => {
    db.all(`SELECT * FROM reservations ORDER BY date ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. API: Update/Edit Data Reservasi
app.put('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const { name, whatsapp, email, package: pkg, date, time, notes } = req.body;
    
    const query = `UPDATE reservations SET name = ?, whatsapp = ?, email = ?, package = ?, date = ?, time = ?, notes = ? WHERE id = ?`;
    
    db.run(query, [name, whatsapp, email, pkg, date, time, notes, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Data berhasil diperbarui' });
    });
});

// 4. API: Hapus Data Reservasi
app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM reservations WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Data berhasil dihapus' });
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});