import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema'; // 型補完が効くようになります

export const db = drizzle(sql, { schema });
