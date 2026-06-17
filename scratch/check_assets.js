const https = require('https');

const url = 'https://iberaugjjhjgbwkzxswk.supabase.co/rest/v1/assets?select=id,code,name,room,brand,model,status';
const key = 'sb_publishable_Cnit-KuO8o1NtlOoRAyMQg_BegSURgQ';

const options = {
  method: 'GET',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(url, options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      console.log('Status Code:', res.statusCode);
      const parsed = JSON.parse(data);
      console.log('Assets count:', parsed.length);
      console.log('First 5 assets:', parsed.slice(0, 5));
      console.log('Unique rooms:', [...new Set(parsed.map(a => a.room).filter(Boolean))]);
    } catch (e) {
      console.log('Response raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('HTTPS request error:', e);
});

req.end();
