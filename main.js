const http = require('http');
const fs = require('fs');
const path = require('path');

const cache = './cache';

const getFilePath = (code) => path.join(cache, `${code}.jpg`);

const server = http.createServer(async (req, res) => {
  const code = req.url.slice(1); // отримуємо код зі шляху

  if (req.method === 'PUT') {
    const filePath = getFilePath(code);  // отримуємо шлях до файлу в кеші
    const writeStream = fs.createWriteStream(filePath);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      res.writeHead(201, { 'Content-Type': 'text/plain' });
      res.end('File created');
    });

    writeStream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      console.error(err);
    });

  } else if (req.method === 'GET') {
    const filePath = getFilePath(code);

    try {
      const data = await fs.promises.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }
});

// Перевірка на існування кеш-директорії
if (!fs.existsSync(cache)) {
  fs.mkdirSync(cache, { recursive: true });
}

server.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/');
});
