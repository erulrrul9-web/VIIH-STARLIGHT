const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mengarahkan ke folder public tempat index.html berada
app.use(express.static(path.join(__dirname, 'public')));

// API Endpoint FAKE FF (Contoh dari kodenya)
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

// Routing utama untuk halaman web
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Penting untuk Vercel Serverless
module.exports = app;
