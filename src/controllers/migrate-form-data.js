import { readFile } from 'node:fs/promises';
import { MongoClient } from 'mongodb';
import { databaseName, collectionName, mongoUri } from '../config/env.js';

if (!mongoUri || mongoUri.includes('<db_password>')) {
  throw new Error('Set MONGODB_URI in .env before migrating.');
}

const payload = JSON.parse(await readFile(new URL('../data/form-data.json', import.meta.url), 'utf8'));
const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });

try {
  await client.connect();
  const collection = client.db(databaseName).collection(collectionName);
  const data = payload.form || payload.saved || payload.draft || payload;
  await collection.deleteMany({});
  await collection.insertOne({ _id: 'form', data, updatedAt: new Date() });
  console.log('Migrated form-data.json into the form record.');
} catch (error) {
  console.error('MongoDB migration failed:', error.message);
  console.error('Check the Atlas IP access list, database password, and whether the password is URL-encoded.');
  process.exitCode = 1;
} finally {
  await client.close();
}
