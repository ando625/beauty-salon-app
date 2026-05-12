// frontend / src / app / reservations / page.tsx

// getReservations関数とReservation型を読み込む
import { getReservations, Reservation } from '../../lib/api/reservations';

// Next.jsのサーバーコンポーネント（デフォルト）
// asyncをつけることでサーバー側でデータを取得できる
// Laravelで言うとControllerでDBからデータ取得してviewに渡すイメージ
export default async function ReservationsPage() {
  // サーバー側でAPIを呼び出して予約データを取得
  // awaitで「データが来るまで待つ」
  const reservations = await getReservations();

  return (
    <div>
      <h1>予約一覧</h1>

      {/* reservations.length === 0 のとき「データなし」を表示 */}
      {reservations.length === 0 ? (
        <p>予約データがありません</p>
      ) : (
        // データがある場合はリスト表示
        // map = 配列の中身を1件ずつ取り出して表示する
        <ul>
          {reservations.map((reservation: Reservation) => (
            // key = Reactがリストを管理するための識別子
            <li key={reservation.id}>
              {reservation.date} - {reservation.timeSlot} - {reservation.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}