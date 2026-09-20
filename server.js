const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Menyajikan file statis
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dimame')));
app.use(express.static(__dirname));

// Route Utama (Cek otomatis lokasi index.html)
app.get('/', (req, res) => {
  const publicPath = path.join(__dirname, 'public', 'index.html');
  const dimamePath = path.join(__dirname, 'dimame', 'index.html');
  const rootPath = path.join(__dirname, 'index.html');

  if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else if (fs.existsSync(dimamePath)) {
    res.sendFile(dimamePath);
  } else if (fs.existsSync(rootPath)) {
    res.sendFile(rootPath);
  } else {
    res.status(404).send('File index.html tidak ditemukan di server.');
  }
});

// API Fake FF (Tambahkan endpoint kamu di bawah sini jika ada)
app.get('/api/fakeff', async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname) return res.status(400).json({ error: 'Nickname wajib diisi' });
    
    const apiurl = `https://api.nexray.eu.org/maker/fakeff?nick=${encodeURIComponent(nickname)}`;
    const response = await axios.get(apiurl, { responseType: 'arraybuffer', timeout: 60000 });
    
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(response.data));
  } catch (err) {
    res.status(500).json({ error: 'Gagal membuat gambar' });
  }
});

// Catch-all route
app.get('*', (req, res) => {
  const publicPath = path.join(__dirname, 'public', 'index.html');
  const rootPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else if (fs.existsSync(rootPath)) {
    res.sendFile(rootPath);
  } else {
    res.status(404).send('Halaman tidak ditemukan.');
  }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
