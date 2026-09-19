import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
dotenv.config({ path: `${projectRoot}.env` });

export const root = projectRoot;
export const port = Number(process.env.PORT || 3000);
export const mongoUri = process.env.MONGODB_URI;
export const databaseName = process.env.MONGODB_DB || 'cdbe_campaigns';
export const collectionName = process.env.MONGODB_COLLECTION || 'forms';
