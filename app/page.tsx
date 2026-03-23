"use client";

import React, { useState, useEffect } from "react";

// 1. 弱い順に定義（Object.keys はこの順序を維持します）
const MEDALS = {
  NONE: { label: "❌ なし", points: 0, className: "bg-white border-gray-200 text-gray-400" },
  IRON: { label: "🏅 鉄", points: 1, className: "bg-slate-50 border-slate-300 text-slate-700" },
  BRONZE: { label: "🥉 銅", points: 2, className: "bg-orange-50 border-orange-300 text-orange-700" },
  SILVER: { label: "🥈 銀", points: 3, className: "bg-gray-50 border-gray-300 text-gray-700" },
  GOLD: { label: "🥇 金", points: 4, className: "bg-yellow-50 border-yellow-400 text-yellow-800" },
  DIAMOND: {
    label: "💎 ﾀﾞｲﾔ",
    points: 5,
    className: "bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-inner",
  },
} as const;

// 2. 「呪文」を使ってキーの配列を自動生成
const MEDAL_ORDER = Object.keys(MEDALS) as (keyof typeof MEDALS)[];

export default function GolfScoreApp() {
  const [scores, setResults] = useState<string[][]>(
    Array(18)
      .fill(null)
      .map(() => Array(4).fill("NONE")),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/save-score");
        if (res.ok) {
          const data = await res.json();
          // DBにデータがあれば、useStateを上書きする
          if (data && data.scores) {
            setResults(data.scores);
          }
        }
      } catch (error) {
        console.error("データの読み込みに失敗しました", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // タップで次へ（重複はスキップ）
  const toggleMedal = (hole: number, player: number) => {
    const currentMedal = scores[hole][player] as keyof typeof MEDALS;
    let nextIndex = (MEDAL_ORDER.indexOf(currentMedal) + 1) % MEDAL_ORDER.length;
    let nextMedal = MEDAL_ORDER[nextIndex];

    // 排他制御：NONE/DIAMOND以外で、他の人が既に持っているメダルならスキップ
    while (
      nextMedal !== "NONE" &&
      nextMedal !== "DIAMOND" &&
      scores[hole].some((m, p) => p !== player && m === nextMedal)
    ) {
      nextIndex = (nextIndex + 1) % MEDAL_ORDER.length;
      nextMedal = MEDAL_ORDER[nextIndex];
    }

    const newScores = [...scores];
    newScores[hole] = [...newScores[hole]]; // Prettierが喜ぶイミュータブルな書き方
    newScores[hole][player] = nextMedal;
    setResults(newScores);
    saveToDb(newScores);
  };

  const calculateTotal = (playerIdx: number) => {
    return scores.reduce((sum, hole) => {
      const medalKey = hole[playerIdx] as keyof typeof MEDALS;
      return sum + MEDALS[medalKey].points;
    }, 0);
  };

  // スコアをDBに保存する関数
  const saveToDb = async (latestScores: string[][]) => {
    try {
      await fetch("/api/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: latestScores }),
      });
      console.log("Saved successfully");
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Data loding...</div>;
  }

  return (
    <div className="p-4 font-sans max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-emerald-800">⛳️ オリンピック集計</h1>

      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="p-3 text-sm">Hole</th>
              {[1, 2, 3, 4].map((p) => (
                <th key={p} className="p-3 text-sm border-l border-emerald-500">
                  Player {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scores.map((holeResults, holeIdx) => (
              <tr
                key={holeIdx}
                className="border-b border-gray-100 last:border-0 hover:bg-emerald-50/30 transition-colors"
              >
                <td className="p-2 text-center font-bold bg-gray-50 text-gray-600 border-r">{holeIdx + 1}</td>
                {holeResults.map((medal, playerIdx) => {
                  const medalInfo = MEDALS[medal as keyof typeof MEDALS];
                  return (
                    <td key={playerIdx} className="p-1">
                      <button
                        onClick={() => toggleMedal(holeIdx, playerIdx)}
                        className={[
                          "w-full py-4 px-1 rounded-lg text-xs border-2 transition-all duration-75",
                          "active:scale-95 flex flex-col items-center justify-center gap-1",
                          medalInfo.className,
                        ].join(" ")}
                      >
                        <span className="text-base leading-none">{medalInfo.label.split(" ")[0]}</span>
                        <span className="scale-90">{medalInfo.label.split(" ")[1]}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 z-10">
            <tr
              className={[
                "bg-emerald-100 font-bold border-t-2 border-emerald-500",
                "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]",
              ].join(" ")}
            >
              <td className="p-3 text-center text-emerald-800 border-r border-emerald-200">Total</td>
              {[0, 1, 2, 3].map((pIdx) => (
                <td key={pIdx} className="p-3 text-center text-xl text-emerald-900 border-l border-emerald-200">
                  {calculateTotal(pIdx)}
                  <span className="text-xs ml-1 font-normal text-emerald-600">pt</span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
