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
  status: "CONFIRMED" | "CANCELLED";

  // バックエンドが予約と一緒に返してくれるスタッフ情報
  // staffs.ts の Staff 型とは別もの！
  // こちらは「予約に紐づいた」スタッフだけ
  staff?: {
    id: number;
    user: {
      name: string; // ← staffs.ts を見ると user.name に名前がある！
    };
  } | null;

  // バックエンドが予約と一緒に返してくれるメニュー情報
  // ReservationMenu（中間テーブル）の配列
  reservationMenus?: {
    menu: {
      id: number;
      name: string; // ← menus.ts の Menu 型と同じ形
    };
  }[];

  // 非会員情報。会員予約のときは null
  guestInfo: {
    name: string;
    phone: string;
    email: string;
  } | null;
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



const API_URL_CLIENT = process.env.NEXT_PUBLIC_API_URL;
// ↑ ブラウザ側からAPIを呼ぶ用のURL

// 空き枠を取得する関数
// staffId = スタッフのID（0 = 誰でもいい）
// date    = 日付文字列（例: "2025-06-01"）
export type AvailableSlots = {
  date: string;
  staffId: number;
  availableSlots: string[]; // 例: ["10:00", "15:00"]
};

export const getAvailableSlots = async (
  staffId: number,
  date: string,
): Promise<AvailableSlots> => {
  const res = await fetch(
    `${API_URL_CLIENT}/reservations/slots?staffId=${staffId}&date=${date}`,
  );
  if (!res.ok) throw new Error('空き枠の取得に失敗しました');
  return res.json();
};

// 予約を作成する関数
export type CreateReservationInput = {
  staffId: number;
  date: string;
  timeSlot: string;
  menuIds: number[];
  userId?: number;
  notes?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
};

export const createReservation = async (
  input: CreateReservationInput,
): Promise<Reservation> => {
  const res = await fetch(`${API_URL_CLIENT}/reservations`, {
    method: 'POST',
    // ↑ 「POSTリクエストで送って」という指定
    headers: {
      'Content-Type': 'application/json',
      // ↑ 「JSONデータを送りますよ」とサーバーに伝える
    },
    body: JSON.stringify(input),
    // ↑ JavaScriptのオブジェクトをJSON文字列に変換して送る
    // 例: { staffId: 1, date: "2025-06-01" }
    //   → '{"staffId":1,"date":"2025-06-01"}'
  });
  if (!res.ok) throw new Error('予約の作成に失敗しました');
  return res.json();
};