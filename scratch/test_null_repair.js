const https = require('https');

const url = 'https://iberaugjjhjgbwkzxswk.supabase.co/rest/v1/asset_repairs';
const key = 'sb_publishable_Cnit-KuO8o1NtlOoRAyMQg_BegSURgQ';

const testRepair = {
  asset_id: null,
  reporter: 'Test Reporter',
  description: 'Test description for null asset_id',
  status: 'แจ้งแล้ว'
};

const options = {
  method: 'POST',
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
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
      console.log('Response:', parsed);
    } catch (e) {
      console.log('Response raw data:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('HTTPS request error:', e);
});

req.write(JSON.stringify(testRepair));
req.end();
