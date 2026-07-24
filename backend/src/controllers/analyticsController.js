const { dbQuery } = require('../config/database');

// Individual QR Analytics
const getQRAnalytics = async (req, res) => {
  const qrId = req.params.id;

  try {
    // Verify ownership
    const qr = await dbQuery.get('SELECT * FROM qr_codes WHERE id = ? AND user_id = ?', [qrId, req.user.id]);
    if (!qr) {
      return res.status(404).json({ error: 'QR code not found or access denied.' });
    }

    // 1. Total Scans
    const totalScansRow = await dbQuery.get('SELECT COUNT(*) as count FROM scans WHERE qr_code_id = ?', [qrId]);
    const totalScans = totalScansRow ? totalScansRow.count : 0;

    // 2. Scans over time (last 30 days grouped by date)
    const timeSeries = await dbQuery.all(
      `SELECT DATE(scanned_at) as date, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ?
       GROUP BY DATE(scanned_at)
       ORDER BY date ASC`,
      [qrId]
    );

    // 3. Devices breakdown
    const devices = await dbQuery.all(
      `SELECT device_type, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ?
       GROUP BY device_type
       ORDER BY count DESC`,
      [qrId]
    );

    // 4. Operating Systems breakdown
    const osBreakdown = await dbQuery.all(
      `SELECT os_name, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ?
       GROUP BY os_name
       ORDER BY count DESC
       LIMIT 8`,
      [qrId]
    );

    // 5. Browsers breakdown
    const browsers = await dbQuery.all(
      `SELECT browser_name, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ?
       GROUP BY browser_name
       ORDER BY count DESC
       LIMIT 8`,
      [qrId]
    );

    // 6. Top Locations (Countries & Cities)
    const countries = await dbQuery.all(
      `SELECT country, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ?
       GROUP BY country
       ORDER BY count DESC
       LIMIT 10`,
      [qrId]
    );

    const cities = await dbQuery.all(
      `SELECT city, country, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ?
       GROUP BY city, country
       ORDER BY count DESC
       LIMIT 10`,
      [qrId]
    );

    // 7. Recent Scans (Latest 20)
    const recentScans = await dbQuery.all(
      `SELECT id, scanned_at, anonymized_ip, country, city, device_type, os_name, browser_name, referrer
       FROM scans
       WHERE qr_code_id = ?
       ORDER BY scanned_at DESC
       LIMIT 20`,
      [qrId]
    );

    res.json({
      qr_code: qr,
      total_scans: totalScans,
      time_series: timeSeries,
      devices: devices,
      os_breakdown: osBreakdown,
      browsers: browsers,
      countries: countries,
      cities: cities,
      recent_scans: recentScans
    });

  } catch (error) {
    console.error('QR Analytics Error:', error);
    res.status(500).json({ error: 'Failed to generate QR analytics.' });
  }
};

// Aggregated User Overview Analytics
const getAggregatedOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total QRs count & status summary
    const summary = await dbQuery.get(
      `SELECT 
         COUNT(*) as total_qrs,
         SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_qrs,
         SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_qrs
       FROM qr_codes
       WHERE user_id = ?`,
      [userId]
    );

    // Total Scans across all QRs
    const totalScansRow = await dbQuery.get(
      `SELECT COUNT(s.id) as count
       FROM scans s
       JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ?`,
      [userId]
    );

    // Scans Today
    const scansTodayRow = await dbQuery.get(
      `SELECT COUNT(s.id) as count
       FROM scans s
       JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ? AND DATE(s.scanned_at) = DATE('now')`,
      [userId]
    );

    // Top Performing QR codes
    const topQRs = await dbQuery.all(
      `SELECT q.id, q.title, q.short_id, q.destination_url, q.is_active, COUNT(s.id) as scan_count
       FROM qr_codes q
       LEFT JOIN scans s ON q.id = s.qr_code_id
       WHERE q.user_id = ?
       GROUP BY q.id
       ORDER BY scan_count DESC
       LIMIT 5`,
      [userId]
    );

    // Aggregated Daily Scan Trend (Last 30 days)
    const timeSeries = await dbQuery.all(
      `SELECT DATE(s.scanned_at) as date, COUNT(s.id) as count
       FROM scans s
       JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ?
       GROUP BY DATE(s.scanned_at)
       ORDER BY date ASC`,
      [userId]
    );

    // Aggregated Devices
    const devices = await dbQuery.all(
      `SELECT s.device_type, COUNT(s.id) as count
       FROM scans s
       JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ?
       GROUP BY s.device_type
       ORDER BY count DESC`,
      [userId]
    );

    res.json({
      total_qrs: summary ? summary.total_qrs : 0,
      active_qrs: summary ? summary.active_qrs : 0,
      inactive_qrs: summary ? summary.inactive_qrs : 0,
      total_scans: totalScansRow ? totalScansRow.count : 0,
      scans_today: scansTodayRow ? scansTodayRow.count : 0,
      top_qrs: topQRs,
      time_series: timeSeries,
      devices: devices
    });

  } catch (error) {
    console.error('Overview Analytics Error:', error);
    res.status(500).json({ error: 'Failed to generate overview analytics.' });
  }
};

module.exports = { getQRAnalytics, getAggregatedOverview };
