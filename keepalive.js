const https = require('https');
const http = require('http');

const BACKEND_URL = 'https://erino-internship-trial-backend.onrender.com';

function pingBackend() {
  const url = new URL(BACKEND_URL + '/ping');
  const client = url.protocol === 'https:' ? https : http;
  
  const req = client.request(url, { method: 'GET' }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[${new Date().toISOString()}] Ping successful:`, JSON.parse(data));
    });
  });
  
  req.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Ping failed:`, err.message);
  });
  
  req.setTimeout(10000, () => {
    console.error(`[${new Date().toISOString()}] Ping timeout`);
    req.destroy();
  });
  
  req.end();
}

console.log('Starting keepalive service...');
console.log(`Backend URL: ${BACKEND_URL}`);

// Ping immediately
pingBackend();

// Then ping every 10 minutes (600000 ms)
setInterval(pingBackend, 10 * 60 * 1000);

console.log('Keepalive service started. Pinging every 10 minutes...');
