// frontend/src/app/admin/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  // 入力したパスワード

  const [error, setError] = useState("");
  // エラーメッセージ

  const [isLoading, setIsLoading] = useState(false);
  // 送信中フラグ

  async function handleLogin() {
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Next.js の API Route に POST リクエストを送る
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        // JSON.stringify = オブジェクトをJSON文字列に変換
      });

      if (!res.ok) {
        // 認証失敗
        setError("パスワードが違います");
        return;
      }

      // 認証成功 → 管理画面へ移動
      router.push("/admin/reservations");
    } catch {
      setError("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {/*
        flex            = 横並び
        items-center    = 縦方向を中央揃え
        justify-center  = 横方向を中央揃え
        → 画面の真ん中にカードが来る
      */}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        {/* max-w-sm = 最大幅 384px（スマホサイズ） */}

        {/* ヘッダー */}
        <div className="text-center mb-8">
          <p className="text-2xl mb-2">✂️</p>
          <h1 className="text-xl font-bold text-gray-900">管理画面</h1>
          <p className="text-sm text-gray-500 mt-1">スタッフ専用</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* パスワード入力 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            パスワード
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              // Enterキーを押してもログインできる
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="パスワードを入力"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* ログインボタン */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "ログイン中..." : "ログイン"}
        </button>
      </div>
    </div>
  );
}
