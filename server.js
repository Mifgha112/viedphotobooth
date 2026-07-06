const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());

// ⚠️ GANTI DENGAN DATA DARI SUPABASE KAMU
const SUPABASE_URL = 'https://zcwetmteghrdgpynsgax.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjd2V0bXRlZ2hyZGdweW5zZ2F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzMTMzMjMsImV4cCI6MjA5ODg4OTMyM30.I4sl6dFsbm9O6iYtWfipUY4jt_uBas8Kfvm5ppK-9-I'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Menyajikan file HTML & CSS dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// API: Simpan Reservasi Baru dari Pelanggan
app.post('/api/reservations', async (req, res) => {
    const { name, whatsapp, email, package, date, time, notes } = req.body;
    const booking_code = 'VS-' + Math.floor(1000 + Math.random() * 9000);

    const { data, error } = await supabase
        .from('reservations')
        .insert([{ name, whatsapp, email, package, date, time, notes, booking_code }])
        .select();

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data[0]);
});

// API: Ambil Semua Data untuk Halaman Admin Dashboard
app.get('/api/admin/reservations', async (req, res) => {
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// Jalankan Server Port Otomatis
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

module.exports = app; // Penting agar Vercel bisa membaca express