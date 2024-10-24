const http = require('http');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');

const cache = './cache';

const getFilePath = (code) => path.join(cache, `${code}.jpg`);

const server = http.createServer(async (req, res) => {
  const code = req.url.slice(1);  // Отримуємо код з URL (наприклад, /200)

  if (req.method === 'GET') {
    const filePath = getFilePath(code);

    try {
      // Перевіряємо, чи зображення існує в кеші
      const data = await fs.promises.readFile(filePath);
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);
    } catch (error) {
      // Якщо не знайдено в кеші, отримуємо з http.cat
      try {
        const response = await superagent.get(`https://http.cat/${code}`);
        await fs.promises.writeFile(filePath, response.body);  // Зберігаємо зображення у кеш
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(response.body);
      } catch (fetchError) {
        console.error(fetchError);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Image not found on http.cat');
      }
    }

  } else if (req.method === 'PUT') {
    const filePath = getFilePath(code);
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

  } else if (req.method === 'DELETE') {
    const filePath = getFilePath(code);

    try {
      await fs.promises.access(filePath);  // Перевіряємо, чи файл існує
      await fs.promises.unlink(filePath);  // Видаляємо файл
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('File deleted');
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method not allowed');
  }
});

// Створюємо директорію кешу, якщо вона не існує
if (!fs.existsSync(cache)) {
  fs.mkdirSync(cache, { recursive: true });
}

server.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/');
});

// Дозволяємо вводити дані в консолі під час роботи сервера
process.stdin.resume(); // Тримати stdin відкритим
process.stdin.setEncoding('utf8');

process.stdin.on('data', (input) => {
  console.log(`You entered: ${input.trim()}`);
});