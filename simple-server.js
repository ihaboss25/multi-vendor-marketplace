const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify({
    success: true,
    message: 'Simple server is working!',
    timestamp: new Date().toISOString()
  }));
});

server.listen(5001, '0.0.0.0', () => {
  console.log('Simple HTTP server listening on http://0.0.0.0:5001');
});
