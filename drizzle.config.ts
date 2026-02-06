import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});
export default defineConfig({
  schema: "./db/schema.ts", // 設計図の場所
  out: "./drizzle", // マイグレーションファイルの出力先
  dialect: "postgresql", // 使うDBの種類
  dbCredentials: {
    url: process.env.POSTGRES_URL!, // .env.localからURLを読み込む
  },
});
