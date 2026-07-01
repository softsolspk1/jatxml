const https = require('https');

const req = https.request('https://5a34edfcf71a3c6ebfc157615e961391.r2.cloudflarestorage.com/softsols1/test', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'PUT',
    'Access-Control-Request-Headers': 'Content-Type'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log('HEADERS:', res.headers);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
