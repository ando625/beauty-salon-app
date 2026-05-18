// frontend/src/app/admin/reservations/page.tsx

// 管理画面のサーバーコンポーネント
// データ取得だけ担当して AdminClient に渡す
// Laravelで言うと Controller でデータ取得して view に渡すイメージ
import { getReservations } from "../../../lib/api/reservations";
import { AdminClient } from "./AdminClient";

export default async function AdminReservationsPage() {
  // サーバー側でAPIを呼んで全予約を取得
  const reservations = await getReservations();

  // AdminClient（クライアントコンポーネント）にデータを渡す
  return <AdminClient reservations={reservations} />;
}
