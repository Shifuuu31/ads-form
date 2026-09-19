function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 512 * 1024) reject(new Error('Request too large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export function createFormController(getCollection) {
  return async function handleFormApi(req, res, url) {
    const collection = getCollection();
    if (url.pathname === '/api/forms/export' && req.method === 'GET') {
      if (!collection) return json(res, 503, { error: 'MongoDB is unavailable.' });
      const documents = await collection.find({}).toArray();
      return json(res, 200, { exportedAt: new Date().toISOString(), documents });
    }

    if (url.pathname === '/api/forms/clear' && req.method === 'DELETE') {
      if (!collection) return json(res, 503, { error: 'MongoDB is unavailable.' });
      const result = await collection.deleteMany({});
      return json(res, 200, { ok: true, deletedCount: result.deletedCount });
    }

    if (url.pathname === '/api/forms/migrate' && req.method === 'POST') {
      if (!collection) return json(res, 503, { error: 'MongoDB is unavailable.' });
      const payload = JSON.parse(await readBody(req));
      const data = payload.form || payload.saved || payload.draft || payload;
      await collection.deleteMany({});
      await collection.replaceOne({ _id: 'form' }, { _id: 'form', data, updatedAt: new Date() }, { upsert: true });
      return json(res, 200, { ok: true, migrated: 'form' });
    }

    const match = url.pathname.match(/^\/api\/forms\/(form)$/);
    if (!match) return false;
    if (!collection) return json(res, 503, { error: 'MongoDB is not configured.' });

    const id = match[1];
    if (req.method === 'GET') {
      let document = await collection.findOne({ _id: id });
      if (!document) {
        const legacy = await collection.findOne({ _id: 'saved' }) || await collection.findOne({ _id: 'draft' });
        if (legacy) {
          await collection.replaceOne({ _id: 'form' }, { _id: 'form', data: legacy.data, updatedAt: new Date() }, { upsert: true });
          document = await collection.findOne({ _id: 'form' });
          await collection.deleteMany({ _id: { $in: ['draft', 'saved'] } });
        }
      }
      return json(res, 200, document ? { exists: true, data: document.data } : { exists: false });
    }

    if (req.method === 'PUT') {
      const data = JSON.parse(await readBody(req));
      await collection.replaceOne({ _id: id }, { _id: id, data, updatedAt: new Date() }, { upsert: true });
      return json(res, 200, { ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return json(res, 405, { error: 'Method not allowed' });
  };
}
