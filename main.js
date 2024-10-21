const http = require('http');
const { program } = require('commander');
const fs = require('fs');

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

// Створення веб-сервера
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Server is running\n');
});

// Запуск сервера
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
