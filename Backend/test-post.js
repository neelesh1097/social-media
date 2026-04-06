import http from 'http';

const data = JSON.stringify({ content: 'Test post', post_type: 'text' });

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/post/add',
  method: 'POST',
  headers: {
    'x-dev-bypass': '1',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let result = '';
  res.on('data', (chunk) => { result += chunk; });
  res.on('end', () => { 
    console.log(`STATUS: ${res.statusCode}`);
    try {
      console.log(JSON.stringify(JSON.parse(result), null, 2));
    } catch (e) {
      console.log(result);
    }
  });
});

req.on('error', (e) => console.error('ERROR:', e.message));
req.write(data);
req.end();
