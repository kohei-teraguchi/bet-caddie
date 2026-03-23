import { pgTable, integer, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const scoresTable = pgTable('scores', {
  id: integer('id').primaryKey(), // 今回は 1 固定で運用
  data: jsonb('data').$type<string[][]>().notNull(), // 型安全に配列を扱う
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
