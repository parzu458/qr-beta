/**
 * GDPR-compliant IP Anonymization Utility
 * Truncates IPv4 last octet and IPv6 lower bits to protect user identity.
 */

function anonymizeIP(ip) {
  if (!ip) return '127.0.0.xxx';

  // Clean proxy headers or IPv6-mapped IPv4 addresses (e.g. ::ffff:192.168.1.1)
  let cleanIp = ip.split(',')[0].trim();
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.replace('::ffff:', '');
  }

  // Handle Localhost / Local IPs
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
    return '127.0.0.xxx (Localhost)';
  }

  // Check IPv4 vs IPv6
  if (cleanIp.includes('.')) {
    // IPv4: Replace last octet with 'xxx'
    const parts = cleanIp.split('.');
    if (parts.length === 4) {
      parts[3] = 'xxx';
      return parts.join('.');
    }
  } else if (cleanIp.includes(':')) {
    // IPv6: Keep only prefix (first 3 segments)
    const parts = cleanIp.split(':');
    if (parts.length >= 3) {
      return `${parts[0]}:${parts[1]}:${parts[2]}::xxxx`;
    }
  }

  return 'Anonymized IP';
}

module.exports = { anonymizeIP };
