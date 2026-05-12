// frontend/src/lib/api/reservations.ts

// APIのベースURLを環境変数から取得する
// process.env.NEXT_PUBLIC_API_URL = .envファイルに書いた値
// NEXT_PUBLIC_ をつけるとブラウザ側でも使える環境変数になる
const API_URL = process.env.API_URL;

// 予約データの型定義
export type Reservation = {
  id: number;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
};

// 予約一覧を取得する関数
// Promise<Reservation[]> = 「Reservation型の配列が返ってくるよ」という宣言
export const getReservations = async (): Promise<Reservation[]> => {
  // fetch = URLにHTTPリクエストを送る関数
  const res = await fetch(`${API_URL}/reservations`);

  // res.ok = レスポンスが200番台かどうか
  // うまくいかなかった場合はエラーを投げる
  if (!res.ok) throw new Error('予約の取得に失敗しました');

  // レスポンスをJSON形式に変換して返す
  return res.json();
};