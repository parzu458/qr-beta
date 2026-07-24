const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const { dbQuery } = require('./config/database');
const { authMiddleware } = require('./middleware/authMiddleware');
const { register, login, getMe, getAccessLogs } = require('./controllers/authController');
const {
  getQRCodes,
  createQRCode,
  getQRCodeById,
  updateQRCode,
  toggleQRCode,
  deleteQRCode
} = require('./controllers/qrController');
const { handleRedirect } = require('./controllers/redirectController');
const { getQRAnalytics, getAggregatedOverview } = require('./controllers/analyticsController');

const app = express();
const PORT = process.env.PORT || 5000;

// Configurazione Reverse Proxy sicura
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : true);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend build
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// --- DYNAMIC REDIRECT ROUTE (Core QR Tracking) ---
app.get('/r/:shortId', handleRedirect);

// --- AUTH ROUTES ---
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authMiddleware, getMe);
app.get('/api/auth/access-logs', authMiddleware, getAccessLogs);

// --- QR CODE CRUD ROUTES ---
app.get('/api/qrcodes', authMiddleware, getQRCodes);
app.post('/api/qrcodes', authMiddleware, createQRCode);
app.get('/api/qrcodes/:id', authMiddleware, getQRCodeById);
app.put('/api/qrcodes/:id', authMiddleware, updateQRCode);
app.patch('/api/qrcodes/:id/toggle', authMiddleware, toggleQRCode);
app.delete('/api/qrcodes/:id', authMiddleware, deleteQRCode);

// --- ANALYTICS ROUTES ---
app.get('/api/qrcodes/:id/analytics', authMiddleware, getQRAnalytics);
app.get('/api/analytics/overview', authMiddleware, getAggregatedOverview);

// --- 404 HANDLER FOR API ROUTES ---
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint API non trovato' });
});

// --- CATCH-ALL ROUTE FOR SPA (React) ---
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('API Server Running. Frontend building...');
    }
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Errore interno del server' 
      : err.message
  });
});

// Seed default demo user and initial QR code if database is empty
async function seedDemoData() {
  try {
    const existingUsers = await dbQuery.get('SELECT COUNT(*) as count FROM users');
    
    // FIX POSTGRESQL: parseInt necessario per convertire la stringa di Postgres in numero
    const userCount = existingUsers ? parseInt(existingUsers.count, 10) : 0;

    if (userCount === 0) {
      console.log('Seeding initial demo user & sample QR code...');
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password123', salt);
      
      const userRes = await dbQuery.run(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        ['demo@example.com', hash, 'Demo User']
      );

      const qr1 = await dbQuery.run(
        `INSERT INTO qr_codes (short_id, user_id, title, destination_url, fg_color, bg_color)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['demo01', userRes.lastID, 'Sito Web Principale', 'https://example.com', '#0f172a', '#ffffff']
      );

      const qr2 = await dbQuery.run(
        `INSERT INTO qr_codes (short_id, user_id, title, destination_url, fg_color, bg_color)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['menu26', userRes.lastID, 'Menu Ristorante Primavera 2026', 'https://example.com/menu', '#0284c7', '#f8fafc']
      );

      const sampleScans = [
        [qr1.lastID, '192.168.1.xxx', 'Italy', 'Milan', 'mobile', 'iOS', 'Safari', 'Direct'],
        [qr1.lastID, '192.168.1.xxx', 'Italy', 'Rome', 'mobile', 'Android', 'Chrome', 'Direct'],
        [qr1.lastID, '192.168.1.xxx', 'Italy', 'Milan', 'desktop', 'macOS', 'Chrome', 'https://google.com'],
        [qr2.lastID, '192.168.1.xxx', 'Italy', 'Turin', 'mobile', 'iOS', 'Safari', 'Direct'],
        [qr2.lastID, '192.168.1.xxx', 'Spain', 'Barcelona', 'mobile', 'Android', 'Chrome', 'Direct'],
      ];

      for (const s of sampleScans) {
        await dbQuery.run(
          `INSERT INTO scans (qr_code_id, anonymized_ip, country, city, device_type, os_name, browser_name, referrer)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          s
        );
      }
      console.log('Demo data seeded successfully! Account: demo@example.com / password123');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

// Inizializza il Seed sia per locale che per Vercel
seedDemoData();

// Avvio locale (se eseguito direttamente con node server.js)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Permanent QR Code Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
