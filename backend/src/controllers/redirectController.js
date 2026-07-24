const useragent = require('express-useragent');
const { dbQuery } = require('../config/database');
const { anonymizeIP } = require('../utils/ipAnonymizer');
const { getGeoLocation } = require('../utils/geoLookup');

const handleRedirect = async (req, res) => {
  const { shortId } = req.params;

  try {
    const qr = await dbQuery.get('SELECT * FROM qr_codes WHERE short_id = ?', [shortId]);

    if (!qr) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Codice QR Non Trovato</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: #1e293b; border: 1px solid #334155; padding: 40px; border-radius: 16px; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h1 { color: #f43f5e; margin-top: 0; }
            p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>QR Code Inesistente</h1>
            <p>Il codice QR scansionato non risulta registrato o è stato eliminato.</p>
          </div>
        </body>
        </html>
      `);
    }

    if (!qr.is_active) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Codice QR Disattivato</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background: #1e293b; border: 1px solid #334155; padding: 40px; border-radius: 16px; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            .icon { font-size: 48px; margin-bottom: 16px; }
            h1 { color: #fbbf24; margin-top: 0; }
            p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; }
            .title { color: #e2e8f0; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">⚠️</div>
            <h1>Codice QR Disattivato</h1>
            <p>Il QR code "<span class="title">${escapeHtml(qr.title)}</span>" è stato temporaneamente disattivato dal proprietario.</p>
          </div>
        </body>
        </html>
      `);
    }

    // Capture scan metrics
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const anonymizedIp = anonymizeIP(rawIp);
    const geo = getGeoLocation(rawIp);

    const uaSource = req.headers['user-agent'] || '';
    const ua = useragent.parse(uaSource);

    let deviceType = 'desktop';
    if (ua.isMobile) deviceType = 'mobile';
    else if (ua.isTablet) deviceType = 'tablet';

    const osName = ua.os || 'Unknown OS';
    const browserName = ua.browser || 'Unknown Browser';
    const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

    // Asynchronously log scan to DB
    dbQuery.run(
      `INSERT INTO scans (qr_code_id, anonymized_ip, country, city, device_type, os_name, browser_name, referrer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [qr.id, anonymizedIp, geo.country, geo.city, deviceType, osName, browserName, referrer]
    ).catch(err => console.error('Scan log error:', err));

    // Redirect to destination URL
    return res.redirect(302, qr.destination_url);

  } catch (error) {
    console.error('Redirect Error:', error);
    return res.status(500).send('Server redirect error.');
  }
};

function escapeHtml(unsafe) {
  return (unsafe || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

module.exports = { handleRedirect };
