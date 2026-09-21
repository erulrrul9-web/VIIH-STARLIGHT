const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ====== FAKEFF ======
app.get('/api/fakeff', async (req, res) => {
    const nickname = req.query.nickname;
    if (!nickname) return res.status(400).json({ error: 'Nickname wajib diisi' });
    try {
        const apiUrl = `https://api.nexray.eu.cc/maker/fakelobyff?nickname=${encodeURIComponent(nickname)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const mime = response.headers['content-type'] || '';
        let buffer;
        if (mime.includes('application/json') || response.status >= 400) {
            let json;
            try { json = JSON.parse(Buffer.from(response.data).toString('utf8')); } catch { return res.status(500).json({ error: `API error HTTP ${response.status}` }); }
            const mediaUrl = json?.result || json?.url || json?.data;
            if (!mediaUrl) return res.status(500).json({ error: 'Media URL tidak ditemukan' });
            const mediaRes = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 30000 });
            buffer = Buffer.from(mediaRes.data);
        } else {
            buffer = Buffer.from(response.data);
        }
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== FAKEFF DUO ======
app.get('/api/fakeffduo', async (req, res) => {
    const { username1, username2 } = req.query;
    if (!username1 || !username2) return res.status(400).json({ error: 'Username1 & Username2 wajib diisi' });
    try {
        const apiUrl = `https://api.snowping.cfd/api/maker/fakeffDuo?username1=${encodeURIComponent(username1)}&username2=${encodeURIComponent(username2)}`;
        const response = await axios.get(apiUrl, { timeout: 60000 });
        let imageUrl = response.data?.result?.url || response.data?.result || response.data?.url || response.data?.data?.url || response.data?.data;
        if (typeof imageUrl === 'object' && imageUrl?.url) imageUrl = imageUrl.url;
        if (!imageUrl) throw new Error('Gagal mendapatkan gambar');
        if (!imageUrl.startsWith('http')) imageUrl = `https://api.snowping.cfd/${imageUrl.replace(/^\//, '')}`;
        const img = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        res.set('Content-Type', 'image/png');
        res.send(Buffer.from(img.data));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== IQC ======
app.get('/api/iqc', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.status(400).json({ error: 'Text wajib diisi' });
    try {
        const apiUrl = `https://api.azbry.com/api/maker/iqc?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 30000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (response.status >= 400) return res.status(500).json({ error: `API error ${response.status}` });
        const mime = response.headers['content-type'] || '';
        let buffer;
        if (mime.includes('application/json')) {
            const json = JSON.parse(Buffer.from(response.data).toString('utf8'));
            const mediaUrl = json?.result || json?.url || json?.data;
            if (!mediaUrl) throw new Error('Media URL tidak ditemukan');
            const img = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            buffer = Buffer.from(img.data);
        } else {
            buffer = Buffer.from(response.data);
        }
        res.set('Content-Type', mime.includes('image') ? mime : 'image/png');
        res.send(buffer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== PLAY MUSIC ======
app.get('/api/play', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Query wajib diisi' });
    try {
        const { data } = await axios.get(`https://api.azbry.com/api/download/ytplay2?q=${encodeURIComponent(q)}`, { timeout: 60000 });
        if (!data.status || !data.result) throw new Error('Gagal mengambil data');
        const r = data.result;
        res.json({ status: true, title: r.title, channel: r.channel, thumbnail: r.thumbnail, download: r.download });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== NULIS ======
app.get('/api/nulis', async (req, res) => {
    const text = req.query.text;
    if (!text) return res.status(400).json({ error: 'Text wajib diisi' });
    try {
        const apiUrl = `https://api.nexray.eu.cc/maker/nulis?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const mime = response.headers['content-type'] || '';
        let buffer;
        if (mime.includes('application/json') || response.status >= 400) {
            let json;
            try { json = JSON.parse(Buffer.from(response.data).toString('utf8')); } catch { return res.status(500).json({ error: `API error ${response.status}` }); }
            const mediaUrl = json?.result || json?.url || json?.data;
            if (!mediaUrl) throw new Error('Media URL tidak ditemukan');
            const img = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            buffer = Buffer.from(img.data);
        } else {
            buffer = Buffer.from(response.data);
        }
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== TIKTOK DOWNLOADER ======
app.get('/api/tiktok', async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'URL wajib diisi' });
    if (!/tiktok\.com/i.test(url)) return res.status(400).json({ error: 'URL TikTok tidak valid' });
    try {
        const { data } = await axios.get(`https://api.snowping.cfd/api/downloader/tiktok?url=${encodeURIComponent(url)}`, { timeout: 60000 });
        const r = data.result || data.data || data;
        if (!r) throw new Error('Data tidak ditemukan');
        let isSlide = false, slideImages = [], videoUrl = null;
        if (r.images && Array.isArray(r.images) && r.images.length > 0) {
            isSlide = true;
            slideImages = r.images;
        } else {
            videoUrl = r.play || r.nowm || r.video || r.url;
        }
        res.json({ status: true, isSlide, slideImages, videoUrl });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== FAKESALDO ======
app.get('/api/fakesaldo', async (req, res) => {
    const nominal = req.query.nominal;
    if (!nominal) return res.status(400).json({ error: 'Nominal wajib diisi' });
    try {
        const apiUrl = `https://api.nexray.eu.cc/maker/fakedana?nominal=${encodeURIComponent(nominal)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const mime = response.headers['content-type'] || '';
        let buffer;
        if (mime.includes('application/json') || response.status >= 400) {
            let json;
            try { json = JSON.parse(Buffer.from(response.data).toString('utf8')); } catch { return res.status(500).json({ error: `API error ${response.status}` }); }
            const mediaUrl = json?.result || json?.url || json?.data;
            if (!mediaUrl) throw new Error('Media URL tidak ditemukan');
            const img = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            buffer = Buffer.from(img.data);
        } else {
            buffer = Buffer.from(response.data);
        }
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ====== CREATE LOGO ======
app.get('/api/createlogo', async (req, res) => {
    const { text1, text2 } = req.query;
    if (!text1 || !text2) return res.status(400).json({ error: 'Text1 & Text2 wajib diisi' });
    try {
        const apiUrl = `https://api.nexray.eu.cc/textpro/marvel?text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&background=logo-2`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer', timeout: 60000, validateStatus: () => true, headers: { 'User-Agent': 'Mozilla/5.0' } });
        const mime = response.headers['content-type'] || '';
        if (mime.includes('application/json') || response.status >= 400) {
            let json;
            try { json = JSON.parse(Buffer.from(response.data).toString('utf8')); } catch { return res.status(500).json({ error: `API error ${response.status}` }); }
            const mediaUrl = json?.result || json?.url || json?.data;
            if (!mediaUrl) throw new Error(json.message || 'Media URL tidak ditemukan');
            const img = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
            res.set('Content-Type', 'image/png');
            return res.send(Buffer.from(img.data));
        }
        res.set('Content-Type', mime || 'image/png');
        res.send(Buffer.from(response.data));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = app;
