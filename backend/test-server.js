/**
 * Quick test — run with: node test-server.js
 * Tests that the backend /health and /api/auth routes respond correctly.
 */
const http = require('http');

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  console.log('\n🔍 Testing CivicPulse Backend...\n');

  // 1. Health check
  try {
    const r = await request('GET', '/health');
    if (r.status === 200) console.log('✅ GET /health →', r.body.status);
    else console.log('❌ GET /health →', r.status, r.body);
  } catch (e) {
    console.log('❌ Backend not reachable. Is it running on port 5000?');
    console.log('   Run: cd backend && npx ts-node src/server.ts');
    process.exit(1);
  }

  // 2. Login with seeded admin
  try {
    const r = await request('POST', '/api/auth/login', {
      email: 'admin@civicpulse.gov',
      password: 'Admin@123',
    });
    if (r.status === 200 && r.body.token) {
      console.log('✅ POST /api/auth/login → token received, user:', r.body.user?.name);
    } else {
      console.log('❌ Login failed:', r.status, r.body);
      console.log('   Did you run the seed? npx ts-node src/scripts/seed.ts');
    }
  } catch (e) {
    console.log('❌ Login request failed:', e.message);
  }

  // 3. Register a new test user
  try {
    const r = await request('POST', '/api/auth/register', {
      name: 'Test User',
      email: `test_${Date.now()}@test.com`,
      password: 'Test@1234',
    });
    if (r.status === 201 && r.body.token) {
      console.log('✅ POST /api/auth/register → user created:', r.body.user?.name);
    } else {
      console.log('❌ Register failed:', r.status, r.body);
    }
  } catch (e) {
    console.log('❌ Register request failed:', e.message);
  }

  console.log('\nDone.\n');
}

run();
