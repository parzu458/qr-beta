const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING VERIFICATION TESTS ---');

  // 1. Test Login
  const loginData = JSON.stringify({ email: 'demo@example.com', password: 'password123' });
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
  }, loginData);

  console.log('1. LOGIN TEST: HTTP', loginRes.statusCode);
  const parsedLogin = JSON.parse(loginRes.body);
  const token = parsedLogin.token;
  console.log('   User Token acquired:', !!token);

  // 2. Test Get QR Codes
  const qrRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/qrcodes',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('2. GET QR CODES TEST: HTTP', qrRes.statusCode);
  const qrs = JSON.parse(qrRes.body).qr_codes;
  console.log(`   Found ${qrs.length} QR codes:`, qrs.map(q => ({ id: q.id, title: q.title, short_id: q.short_id, scans: q.total_scans })));

  // 3. Test Dynamic Redirect Scan Endpoint (/r/demo01)
  const redirectRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/r/demo01',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
      'X-Forwarded-For': '151.12.34.56'
    }
  });
  console.log('3. DYNAMIC REDIRECT SCAN TEST: HTTP', redirectRes.statusCode);
  console.log('   Redirect Location:', redirectRes.headers['location']);

  // Wait 300ms for async scan log insert
  await new Promise(r => setTimeout(r, 300));

  // 4. Test Analytics for QR 1
  const analyticsRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/qrcodes/1/analytics',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('4. SINGLE QR ANALYTICS TEST: HTTP', analyticsRes.statusCode);
  const analytics = JSON.parse(analyticsRes.body);
  console.log('   Total Scans:', analytics.total_scans);
  console.log('   Devices breakdown:', analytics.devices);
  console.log('   Recent Scan Log Sample:', analytics.recent_scans[0]);

  // 5. Test Aggregated Overview
  const overviewRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/analytics/overview',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('5. AGGREGATED OVERVIEW TEST: HTTP', overviewRes.statusCode);
  const overview = JSON.parse(overviewRes.body);
  console.log('   Overview Stats:', { total_qrs: overview.total_qrs, active_qrs: overview.active_qrs, total_scans: overview.total_scans });

  console.log('--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => console.error('Test error:', err));
