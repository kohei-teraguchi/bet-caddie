import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

// lib/schema.ts を作ったら、ここに読み込ませると型補完が効くようになります
import * as schema from "./schema";

export const db = drizzle(sql, { schema });
