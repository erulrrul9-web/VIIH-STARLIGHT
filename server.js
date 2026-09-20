const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Serving file statis
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.static(process.cwd()));

// Handle Route Utama
app.get('/', (req, res) => {
  const publicPath = path.join(process.cwd(), 'public', 'index.html');
  const rootPath = path.join(process.cwd(), 'index.html');

  if (fs.existsSync(publicPath)) {
    return res.sendFile(publicPath);
  } else if (fs.existsSync(rootPath)) {
    return res.sendFile(rootPath);
  } else {
    return res.status(404).send('File index.html tidak ditemukan!');
  }
});

// Endpoint API Fake FF
app.get('/api/fakeff', async (req, res) => {
  try {
    const { nickname } = req.query;
    if (!nickname) return res.status(400).json({ error: 'Nickname wajib diisi' });

    const apiurl = `https://api.nexray.eu.org/maker/fakeff?nick=${encodeURIComponent(nickname)}`;
    const response = await axios.get(apiurl, { responseType: 'arraybuffer', timeout: 30000 });

    res.setHeader('Content-Type', 'image/png');
    return res.send(Buffer.from(response.data));
  } catch (err) {
    return res.status(500).json({ error: 'Gagal mengambil gambar' });
  }
});

// Wajib diexport untuk Vercel Serverless Function
module.exports = app;
