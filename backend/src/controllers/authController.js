const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbQuery } = require('../config/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { anonymizeIP } = require('../utils/ipAnonymizer');

// Logs every access attempt (register/login), successful or not.
// Never throws: a logging failure must never break the auth flow.
const logAccess = async ({ userId = null, email = null, eventType, success, req }) => {
  try {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    await dbQuery.run(
      `INSERT INTO access_logs (user_id, email, event_type, success, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        email ? email.toLowerCase().trim() : null,
        eventType,
        success ? 1 : 0,
        anonymizeIP(rawIp),
        req.headers['user-agent'] || 'Unknown'
      ]
    );
  } catch (err) {
    console.error('Access log error:', err);
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields (email, password, name) are required.' });
    }

    const existingUser = await dbQuery.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      await logAccess({ email, eventType: 'register', success: false, req });
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await dbQuery.run(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email.toLowerCase().trim(), passwordHash, name.trim()]
    );

    const user = { id: result.lastID, email: email.toLowerCase().trim(), name: name.trim() };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    await logAccess({ userId: user.id, email: user.email, eventType: 'register', success: true, req });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userRow = await dbQuery.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!userRow) {
      await logAccess({ email, eventType: 'login', success: false, req });
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      await logAccess({ userId: userRow.id, email, eventType: 'login', success: false, req });
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = { id: userRow.id, email: userRow.email, name: userRow.name };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    await logAccess({ userId: user.id, email: user.email, eventType: 'login', success: true, req });

    res.json({ user, token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

const getMe = async (req, res) => {
  try {
    const userRow = await dbQuery.get('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!userRow) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: userRow });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
};

const getAccessLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const logs = await dbQuery.all(
      `SELECT id, event_type, success, ip_address, user_agent, created_at
       FROM access_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [req.user.id, limit]
    );
    res.json({ logs });
  } catch (error) {
    console.error('Access Logs Error:', error);
    res.status(500).json({ error: 'Server error fetching access logs.' });
  }
};

module.exports = { register, login, getMe, getAccessLogs };
