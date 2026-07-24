const geoip = require('geoip-lite');

/**
 * Approximate IP Geolocation Lookup
 */
function getGeoLocation(ip) {
  if (!ip) return { country: 'Italy', city: 'Milan' };

  let cleanIp = ip.split(',')[0].trim();
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.replace('::ffff:', '');
  }

  // Handle local development IPs gracefully
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
    // Provide realistic default location for local testing
    return { country: 'Italy', city: 'Milan' };
  }

  const geo = geoip.lookup(cleanIp);
  if (geo) {
    return {
      country: geo.country || 'Unknown',
      city: geo.city || 'Unknown'
    };
  }

  return { country: 'Unknown', city: 'Unknown' };
}

module.exports = { getGeoLocation };
