import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';
import { collectionName, databaseName, mongoUri, port, root } from './config/env.js';
import { createFormRoutes } from './routes/formRoutes.js';

let collection;

async function connectMongo() {
  if (!mongoUri || mongoUri.includes('<db_password>')) return;
  try {
    const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
    await client.connect();
    collection = client.db(databaseName).collection(collectionName);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB unavailable; continuing with local storage:', error.message);
  }
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function serveStatic(req, res, url) {
  const requested = url.pathname === '/' ? '/src/formulaire-campagne-meta-ads.html' : url.pathname;
  const filePath = normalize(join(root, requested));
  if (!filePath.startsWith(root)) return sendJson(res, 403, { error: 'Forbidden' });
  try {
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  } catch {
    sendJson(res, 404, { error: 'Not found' });
  }
}

const handleRoutes = createFormRoutes(() => collection);
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      const handled = await handleRoutes(req, res, url);
      if (!handled && !res.writableEnded) sendJson(res, 404, { error: 'API route not found' });
      return;
    }
    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
});

await connectMongo();


server.listen(port, () => console.log(`form running at http://localhost:${port}`));
