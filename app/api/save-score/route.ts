import { db } from "@/db"; // 以前作成したdb接続
import { scoresTable } from "@/db/schema"; // 後で作るスキーマ
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { scores } = await req.json();

    // とりあえず ID=1 のレコードを更新し続ける（1ゲーム1レコード想定）
    // UPSERT (あれば更新、なければ挿入) のロジック
    await db
      .insert(scoresTable)
      .values({
        id: 1,
        data: scores, // 二次元配列をそのまま入れる
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: scoresTable.id,
        set: {
          data: scores,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 1. ID=1 のレコードをピンポイントで取得
    const result = await db
      .select()
      .from(scoresTable)
      .where(eq(scoresTable.id, 1))
      .limit(1);

    // 2. データがあれば返し、なければ空の状態を返す
    // フロントの scores.map が壊れないよう、構造を合わせるのが10年選手の嗜み
    const scoresData = result[0]?.data || null;

    return NextResponse.json({ scores: scoresData });
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

