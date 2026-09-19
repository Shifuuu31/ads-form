import { MongoClient } from 'mongodb';
import { createFormController } from '../../src/controllers/formController.js';

const databaseName = process.env.MONGODB_DB || 'cdbe_campaigns';
const collectionName = process.env.MONGODB_COLLECTION || 'forms';

let cachedClient;
let cachedCollection;

async function getCollection() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri || mongoUri.includes('<db_password>')) return null;
  if (cachedCollection) return cachedCollection;
  cachedClient = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
  await cachedClient.connect();
  cachedCollection = cachedClient.db(databaseName).collection(collectionName);
  return cachedCollection;
}

function createReq(event) {
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64')
    : Buffer.from(event.body || '', 'utf8');
  return {
    method: event.httpMethod || 'GET',
    on(name, cb) {
      if (name === 'data') queueMicrotask(() => { if (raw.length) cb(raw); });
      if (name === 'end') queueMicrotask(cb);
      return this;
    }
  };
}

function createRes() {
  let status = 200;
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  let body = '';
  const res = {
    writableEnded: false,
    setHeader(key, value) {
      headers[key] = value;
    },
    writeHead(nextStatus, nextHeaders) {
      status = nextStatus;
      Object.assign(headers, nextHeaders || {});
    },
    end(chunk) {
      if (chunk != null) body += typeof chunk === 'string' ? chunk : chunk.toString();
      res.writableEnded = true;
    }
  };
  return {
    res,
    result() {
      return { statusCode: status, headers, body };
    }
  };
}

export async function handler(event) {
  const url = new URL(event.rawUrl || `https://${event.headers.host || 'localhost'}${event.path || '/'}`);
  if (!url.pathname.startsWith('/api/')) {
    url.pathname = `/api${url.pathname.startsWith('/') ? '' : '/'}${url.pathname.replace(/^\/\.netlify\/functions\/api\/?/, '') || ''}`;
  }
  let collection = null;
  try {
    collection = await getCollection();
  } catch (error) {
    console.error('MongoDB unavailable:', error.message);
  }
  const handleFormApi = createFormController(() => collection);
  const req = createReq(event);
  const { res, result } = createRes();
  const handled = await handleFormApi(req, res, url);
  if (handled === false && !res.writableEnded) {
    return { statusCode: 404, headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify({ error: 'API route not found' }) };
  }
  return result();
}
