'use strict';
// 本機預覽用的靜態伺服器（無外部依賴）。只監聽 127.0.0.1。
// 不用 python -m http.server：Chrome 同時要求多個程式檔時，它在 Windows 上會偶發掉檔，
// 實驗頁就會缺少 mechanics-scenes.js 等檔案而空白（2026-11-25 試玩：8 次冷啟動失敗 3 次，本伺服器 0 次）。
// 用法：node tools/serve.cjs [port]，預設 8765。
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..'),
  port = Number(process.argv[2]) || 8765,
  types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.cjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg'
  };

http
  .createServer((req, res) => {
    let file;
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      file = path.join(root, pathname.endsWith('/') ? pathname + 'index.html' : pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('找不到 ' + req.url);
        return;
      }
      res.writeHead(200, {
        'content-type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'cache-control': 'no-cache'
      });
      res.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port + '/library.html'));
