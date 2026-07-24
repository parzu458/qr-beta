const crypto = require('crypto');
const { dbQuery } = require('../config/database');

// Generate unique 6-character short ID for permanent URL
function generateShortId() {
  return crypto.randomBytes(4).toString('hex').slice(0, 7);
}

const getQRCodes = async (req, res) => {
  try {
    const qrs = await dbQuery.all(
      `SELECT q.*, 
              COUNT(s.id) AS total_scans,
              MAX(s.scanned_at) AS last_scanned_at
       FROM qr_codes q
       LEFT JOIN scans s ON q.id = s.qr_code_id
       WHERE q.user_id = ?
       GROUP BY q.id
       ORDER BY q.created_at DESC`,
      [req.user.id]
    );

    res.json({ qr_codes: qrs });
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ error: 'Failed to retrieve QR codes.' });
  }
};

const createQRCode = async (req, res) => {
  try {
    const { title, destination_url, fg_color, bg_color, logo_url } = req.body;

    if (!title || !destination_url) {
      return res.status(400).json({ error: 'Title and Destination URL are required.' });
    }

    // Ensure destination_url starts with http:// or https://
    let validUrl = destination_url.trim();
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }

    let short_id = generateShortId();
    // Ensure uniqueness
    let exists = await dbQuery.get('SELECT id FROM qr_codes WHERE short_id = ?', [short_id]);
    while (exists) {
      short_id = generateShortId();
      exists = await dbQuery.get('SELECT id FROM qr_codes WHERE short_id = ?', [short_id]);
    }

    const result = await dbQuery.run(
      `INSERT INTO qr_codes (short_id, user_id, title, destination_url, fg_color, bg_color, logo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        short_id,
        req.user.id,
        title.trim(),
        validUrl,
        fg_color || '#0f172a',
        bg_color || '#ffffff',
        logo_url || null
      ]
    );

    const createdQR = await dbQuery.get('SELECT * FROM qr_codes WHERE id = ?', [result.lastID]);
    res.status(201).json({ qr_code: { ...createdQR, total_scans: 0 } });
  } catch (error) {
    console.error('Error creating QR code:', error);
    res.status(500).json({ error: 'Failed to create QR code.' });
  }
};

const getQRCodeById = async (req, res) => {
  try {
    const qr = await dbQuery.get(
      `SELECT q.*, COUNT(s.id) AS total_scans, MAX(s.scanned_at) AS last_scanned_at
       FROM qr_codes q
       LEFT JOIN scans s ON q.id = s.qr_code_id
       WHERE q.id = ? AND q.user_id = ?
       GROUP BY q.id`,
      [req.params.id, req.user.id]
    );

    if (!qr) {
      return res.status(404).json({ error: 'QR code not found.' });
    }

    res.json({ qr_code: qr });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch QR code details.' });
  }
};

const updateQRCode = async (req, res) => {
  try {
    const { title, destination_url, fg_color, bg_color, logo_url } = req.body;
    const qrId = req.params.id;

    const existing = await dbQuery.get('SELECT id FROM qr_codes WHERE id = ? AND user_id = ?', [qrId, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'QR code not found or access denied.' });
    }

    let validUrl = destination_url ? destination_url.trim() : undefined;
    if (validUrl && !/^https?:\/\//i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }

    await dbQuery.run(
      `UPDATE qr_codes
       SET title = COALESCE(?, title),
           destination_url = COALESCE(?, destination_url),
           fg_color = COALESCE(?, fg_color),
           bg_color = COALESCE(?, bg_color),
           logo_url = COALESCE(?, logo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title ? title.trim() : null, validUrl || null, fg_color || null, bg_color || null, logo_url, qrId, req.user.id]
    );

    const updated = await dbQuery.get('SELECT * FROM qr_codes WHERE id = ?', [qrId]);
    res.json({ qr_code: updated });
  } catch (error) {
    console.error('Error updating QR code:', error);
    res.status(500).json({ error: 'Failed to update QR code.' });
  }
};

const toggleQRCode = async (req, res) => {
  try {
    const qrId = req.params.id;
    const existing = await dbQuery.get('SELECT is_active FROM qr_codes WHERE id = ? AND user_id = ?', [qrId, req.user.id]);
    if (!existing) {
      return res.status(404).json({ error: 'QR code not found or access denied.' });
    }

    const newStatus = existing.is_active ? 0 : 1;
    await dbQuery.run(
      'UPDATE qr_codes SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, qrId]
    );

    res.json({ success: true, is_active: newStatus });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle QR code status.' });
  }
};

const deleteQRCode = async (req, res) => {
  try {
    const qrId = req.params.id;
    const result = await dbQuery.run('DELETE FROM qr_codes WHERE id = ? AND user_id = ?', [qrId, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'QR code not found or access denied.' });
    }

    res.json({ message: 'QR code deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete QR code.' });
  }
};

module.exports = {
  getQRCodes,
  createQRCode,
  getQRCodeById,
  updateQRCode,
  toggleQRCode,
  deleteQRCode
};
