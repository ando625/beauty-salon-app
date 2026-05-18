// frontend/src/app/reservations/complete/page.tsx

// 予約完了ページ（シンプルでOK）
import Link from "next/link";

export default function ReservationCompletePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          予約が完了しました！
        </h1>
        <p className="text-gray-500 mb-6">ご予約ありがとうございます。</p>
        <Link
          href="/"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  );
}
