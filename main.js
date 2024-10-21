const http = require('http');
const { program } = require('commander');
const fs = require('fs');  // стандартний fs для синхронних операцій
const path = require('path');
// Налаштування параметрів командного рядка
program
  .requiredOption('-h, --host <host>', 'server address (host)')
  .requiredOption('-p, --port <port>', 'server port')
  .requiredOption('-c, --cache <cache>', 'path to cache directory');

program.parse(process.argv);

const { host, port, cache } = program.opts();

// Перевірка, чи існує директорія для кешування
if (!fs.existsSync(cache)) {
  console.error(`Cache directory '${cache}' does not exist.`);
  process.exit(1);
}
// Допоміжна функція для отримання шляху до файлу в кеші
const getFilePath = (code) => path.join(cache, `${code}.jpg`);

// Створення сервера
const server = http.createServer(async (req, res) => {
  const code = req.url.slice(1); // отримуємо код з URL

  if (req.method === 'GET') {
    const filePath = getFilePath(code);  // шлях до файлу у кеші

    try {
      const data = await fs.readFile(filePath);  // читаємо файл з кешу
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(data);  // повертаємо файл як зображення
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');  // якщо файл не знайдено, повертаємо 404
    }
  }
});

// Запуск сервера
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
