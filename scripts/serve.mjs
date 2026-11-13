import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const files = new Map([
    ['index.html', 'text/html; charset=utf-8'],
    ['style.css', 'text/css; charset=utf-8'],
    ['main.js', 'text/javascript; charset=utf-8'],
    ['mission.js', 'text/javascript; charset=utf-8'],
    ['saves.js', 'text/javascript; charset=utf-8'],
    ['locales.js', 'text/javascript; charset=utf-8'],
    ['Nunito.ttf', 'font/ttf'],
    ['Nunito-OFL.txt', 'text/plain; charset=utf-8']
]);
const port = Number(process.argv[2] ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const base = new URL('../dist/', import.meta.url);
await readFile(new URL('index.html', base));

createServer(async (request, response) => {
    const path = (request.url ?? '').split('?')[0] ?? '/';
    const file = path === '/' ? 'index.html' : path.slice(1);
    const contentType = files.get(file);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
    }
    if (!contentType) { response.writeHead(404).end(); return; }
    try {
        const content = await readFile(new URL(file, base));
        response.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': content.length,
            'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "default-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'none'"
        });
        response.end(request.method === 'HEAD' ? undefined : content);
    } catch { response.writeHead(404).end(); }
}).listen(port, '127.0.0.1', () => {
    console.log('Technical Showcase: http://127.0.0.1:' + port + '/');
});
