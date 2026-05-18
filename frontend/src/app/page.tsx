// frontend/src/app/page.tsx

// サーバーコンポーネント（データ取得なし・リンクだけなのでそのままでOK）
import Link from 'next/link';
// Link = Next.jsのリンクコンポーネント
// <a>タグより高速にページ遷移できる

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/*
        min-h-screen          = 画面の高さいっぱい
        bg-gradient-to-b      = 上から下へのグラデーション
        from-emerald-50       = 上は薄い緑
        to-white              = 下は白
      */}

      {/* ===== ヘッダー ===== */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-700">
            ✂️ Beauty Salon
          </h1>
          {/* 管理者リンク（目立たせない） */}
          <Link
            href="/admin/reservations"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            管理画面
          </Link>
        </div>
      </header>

      {/* ===== メインコンテンツ ===== */}
      <main className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* キャッチコピー */}
        <p className="text-emerald-600 text-sm font-medium tracking-widest mb-4">
          BEAUTY SALON
          {/* tracking-widest = 文字間隔を広げる */}
        </p>

        <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
          あなたらしさを
          <br />
          引き出すサロン
          {/* leading-tight = 行間を狭める */}
        </h2>

        <p className="text-gray-500 text-base mb-12 leading-relaxed">
          カット・カラー・パーマ・トリートメントなど
          <br />
          お客様一人ひとりに合わせたスタイルをご提案します。
          {/* leading-relaxed = 行間を少し広げる（読みやすい） */}
        </p>

        {/* 予約ボタン（メイン） */}
        <Link
          href="/reservations/new"
          className="inline-block bg-emerald-600 text-white font-bold text-lg px-12 py-4 rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
        >
          ご予約はこちら
        </Link>

        <p className="text-gray-400 text-xs mt-4">
          予約は無料・当日のお支払いのみ
        </p>

        {/* ===== メニュー紹介カード ===== */}
        <div className="grid grid-cols-2 gap-4 mt-16">
          {/*
            grid          = グリッドレイアウト
            grid-cols-2   = 2列に並べる
            gap-4         = カード間の余白 16px
          */}
          {[
            { emoji: "✂️", name: "カット", price: "¥4,000〜", time: "60分" },
            { emoji: "🎨", name: "カラー", price: "¥7,000〜", time: "90分" },
            { emoji: "💫", name: "パーマ", price: "¥8,000〜", time: "120分" },
            {
              emoji: "✨",
              name: "トリートメント",
              price: "¥3,000〜",
              time: "30分",
            },
          ].map((menu) => (
            <div
              key={menu.name}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left shadow-sm"
            >
              <p className="text-2xl mb-2">{menu.emoji}</p>
              <p className="font-bold text-gray-900">{menu.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-emerald-600 font-medium text-sm">
                  {menu.price}
                </p>
                <span className="text-gray-300">·</span>
                <p className="text-gray-400 text-xs">{menu.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* もう一度予約ボタン */}
        <div className="mt-12">
          <Link
            href="/reservations/new"
            className="inline-block border-2 border-emerald-600 text-emerald-600 font-bold px-10 py-3 rounded-2xl hover:bg-emerald-50 transition-colors"
          >
            今すぐ予約する →
          </Link>
        </div>
      </main>

      {/* ===== フッター ===== */}
      <footer className="text-center py-8 text-gray-400 text-xs">
        <p>© 2026 Beauty Salon. All rights reserved.</p>
      </footer>
    </div>
  );
}