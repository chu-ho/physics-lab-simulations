'use strict';
// 產生入口頁縮圖用的本機伺服器：提供專案靜態檔，並接收 tools/capture-thumbs.html 送來的
// WebP，寫到 assets/thumbs/<實驗 id>.webp。只監聽 127.0.0.1，只接受安全的實驗 id。
// 用法：node tools/thumb-server.cjs，再用瀏覽器開啟它印出的網址。
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..'),
  out = path.join(root, 'assets', 'thumbs'),
  types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
  };
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'POST' && url.pathname === '/save-thumb') {
    const id = url.searchParams.get('id') || '';
    if (!/^[a-z0-9-]+$/.test(id)) {
      res.writeHead(400).end('bad id');
      return;
    }
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      if (body.length > 200_000 || body.subarray(8, 12).toString() !== 'WEBP') {
        res.writeHead(400).end('not a small webp');
        return;
      }
      fs.writeFileSync(path.join(out, id + '.webp'), body);
      res.writeHead(200).end('ok ' + body.length);
    });
    return;
  }
  let file = path.join(root, decodeURIComponent(url.pathname));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  });
});
server.listen(Number(process.env.PORT) || 0, '127.0.0.1', () => {
  console.log('http://127.0.0.1:' + server.address().port + '/tools/capture-thumbs.html');
});
