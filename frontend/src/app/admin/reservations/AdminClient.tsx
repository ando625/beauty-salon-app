// frontend/src/app/admin/reservations/AdminClient.tsx

"use client";
// ブラウザで動くコンポーネント
// useState・クリック操作・モーダルが使えるようになる

import { useState, useEffect } from "react";
import { Reservation } from "../../../lib/api/reservations";

type Props = {
  reservations: Reservation[];
};

export function AdminClient({ reservations: initialReservations }: Props) {
  // ----------------------------------------
  // reservations: initialReservations の意味：
  //   props の名前は reservations だけど
  //   このコンポーネント内では initialReservations という名前で使う
  //   「最初に受け取ったデータ」という意味を込めた名前
  // ----------------------------------------

  // キャンセル操作後に画面を更新するため、
  // 予約データを useState で管理する
  const [reservations, setReservations] = useState(initialReservations);

  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // モーダルで表示する予約（nullなら閉じている）
  const [modalReservation, setModalReservation] = useState<Reservation | null>(
    null,
  );

  // キャンセル処理中かどうか（ボタンの二重押し防止）
  const [isCancelling, setIsCancelling] = useState(false);

  // ブラウザ表示後フラグ（Hydrationエラー防止）
  const [isMounted, setIsMounted] = useState(false);

  // 表示中の月
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ----------------------------------------
  // 予約がある日付のSet（ドット表示用）
  // CONFIRMEDの予約だけドットを表示する
  // ----------------------------------------
  const reservedDates = new Set(
    reservations
      .filter((r) => r.status === "CONFIRMED")
      // filter = CONFIRMEDの予約だけ残す
      .map((r) => r.date.split("T")[0]),
  );

  // 選択した日のCONFIRMED予約だけ絞り込む
  const filteredReservations = selectedDate
    ? reservations.filter((r) => {
        const reservationDate = r.date.split("T")[0];
        const selected = toDateString(selectedDate);
        return reservationDate === selected && r.status === "CONFIRMED";
        // r.status === 'CONFIRMED' = キャンセル済みは表示しない
      })
    : [];

  // ----------------------------------------
  // キャンセル処理
  // ----------------------------------------
  async function handleCancel(reservationId: number) {
    // 確認ダイアログを出す
    // confirm() = OKかキャンセルかを選ぶダイアログ
    // false が返ってきたら処理を中断
    if (!confirm("この予約をキャンセルしますか？")) return;

    setIsCancelling(true);
    // ↑ キャンセル処理中フラグをON（ボタンを無効化する）

    try {
      // バックエンドのキャンセルAPIを呼ぶ
      // NEXT_PUBLIC_ = ブラウザ側から呼ぶので NEXT_PUBLIC_ のURLを使う
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}/cancel`,
        { method: "PATCH" },
        // method: 'PATCH' = PATCHリクエストで送る
      );

      if (!res.ok) throw new Error("キャンセルに失敗しました");

      // ----------------------------------------
      // 画面のデータを更新する
      // APIを再取得せず、手元のデータだけ更新する（高速！）
      // map = 全予約を1件ずつ確認して、
      //       対象IDだけ status を CANCELLED に書き換える
      // ----------------------------------------
      setReservations((prev) =>
        prev.map(
          (r) =>
            r.id === reservationId
              ? { ...r, status: "CANCELLED" as const }
              : // { ...r } = rの全フィールドをコピー
                // status: 'CANCELLED' = statusだけ上書き
                r, // 対象でない予約はそのまま
        ),
      );

      // モーダルを閉じる
      setModalReservation(null);
    } catch (error) {
      // エラーが起きたらアラートを出す
      alert("キャンセル処理中にエラーが発生しました");
      console.error(error);
    } finally {
      // 成功・失敗どちらでもフラグをOFF
      setIsCancelling(false);
    }
  }

  // ----------------------------------------
  // カレンダー計算（ReservationsClient と同じ）
  // ----------------------------------------
  const firstDayOfWeek = currentMonth.getDay();
  const lastDate = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: lastDate }, (_, i) => i + 1),
  ];

  function prevMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
    setSelectedDate(null);
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
    setSelectedDate(null);
  }

  function toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const todayStr = toDateString(new Date());

  const formattedSelectedDate = selectedDate
    ? selectedDate.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      })
    : null;

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
  <div className="max-w-2xl mx-auto flex justify-between items-center">
    {/* 左側：タイトル */}
    <div>
      <p className="text-xs text-gray-400 mb-1">管理画面</p>
      <h1 className="text-2xl font-bold text-gray-900">予約管理</h1>
      <p className="text-sm text-gray-500 mt-1">
        確定済み予約：
        {reservations.filter((r) => r.status === 'CONFIRMED').length}件
      </p>
    </div>

    {/* 右側：ログアウトボタン */}
    <button
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/admin/login';
      }}
      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
    >
      ログアウト
    </button>
  </div>
</div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* ===== カレンダー ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          {/* 月ナビゲーション */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 text-xl"
            >
              ‹
            </button>
            <h2 className="text-base font-bold text-gray-900">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </h2>
            <button
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 text-xl"
            >
              ›
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((day, i) => (
              <div
                key={day}
                className={`text-center text-xs font-medium py-2
                  ${i === 0 ? "text-red-400" : ""}
                  ${i === 6 ? "text-blue-400" : ""}
                  ${i !== 0 && i !== 6 ? "text-gray-400" : ""}
                `}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          {isMounted && (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />;
                }

                const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = dateStr === todayStr;
                const isSelected =
                  selectedDate !== null &&
                  toDateString(selectedDate) === dateStr;
                const hasReservation = reservedDates.has(dateStr);
                const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      const clicked = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day,
                      );
                      if (isSelected) {
                        setSelectedDate(null);
                      } else {
                        setSelectedDate(clicked);
                      }
                    }}
                    className={`
                      relative flex flex-col items-center justify-center
                      h-10 rounded-xl text-sm font-medium
                      transition-all duration-150
                      ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-md"
                          : isToday
                            ? "bg-gray-100 text-gray-900 font-bold"
                            : isSunday
                              ? "text-red-400 hover:bg-red-50"
                              : isSaturday
                                ? "text-blue-400 hover:bg-blue-50"
                                : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {day}
                    {hasReservation && (
                      <span
                        className={`absolute bottom-1 w-1 h-1 rounded-full
                          ${isSelected ? "bg-white" : "bg-emerald-400"}
                        `}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== 予約一覧エリア ===== */}
        {selectedDate ? (
          <div>
            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              {formattedSelectedDate} の予約
              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {filteredReservations.length}件
              </span>
            </h2>

            {filteredReservations.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-400">
                  この日の確定済み予約はありません
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReservations.map((reservation) => (
                  <button
                    key={reservation.id}
                    onClick={() => setModalReservation(reservation)}
                    // クリックでモーダルを開く
                    className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all"
                    // w-full     = 横幅いっぱい
                    // text-left  = ボタンでもテキストを左寄せ
                    // hover:border-emerald-300 = ホバーで緑の枠線
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {reservation.staff?.user.name ?? "担当スタッフ未定"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          担当スタッフ
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-lg font-mono">
                          {reservation.timeSlot}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">開始時間</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 my-3" />

                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-1">
                        {reservation.reservationMenus.length > 0 ? (
                          reservation.reservationMenus.map((rm) => (
                            <span
                              key={rm.menu.id}
                              className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md"
                            >
                              {rm.menu.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">
                            メニューなし
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        タップで操作 →
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        お客様：
                        <span className="font-medium text-gray-700 ml-1">
                          {reservation.guestInfo?.name ?? "-"}
                        </span>
                        {reservation.guestInfo?.phone && (
                          <span className="ml-3 text-gray-400">
                            {reservation.guestInfo.phone}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">
              カレンダーから日付を選んでください
            </p>
          </div>
        )}
      </div>

      {/* ===== モーダル ===== */}
      {/* modalReservation が null でなければモーダルを表示 */}
      {modalReservation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setModalReservation(null)}
          // fixed inset-0  = 画面全体を覆う
          // bg-black/50    = 半透明の黒い背景（オーバーレイ）
          // z-50           = 一番手前に表示
          // 背景クリックでモーダルを閉じる
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
            // e.stopPropagation() = クリックイベントが親に伝わるのを止める
            // これがないとカード内クリックでもモーダルが閉じてしまう
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">予約の操作</h3>

            {/* 予約の詳細情報 */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">担当スタッフ</span>
                <span className="font-medium text-gray-900">
                  {modalReservation.staff?.user.name ?? "未定"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">時間</span>
                <span className="font-medium text-gray-900 font-mono">
                  {modalReservation.timeSlot}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">メニュー</span>
                <span className="font-medium text-gray-900">
                  {modalReservation.reservationMenus.length > 0
                    ? modalReservation.reservationMenus
                        .map((rm) => rm.menu.name)
                        .join("・")
                    : "なし"}
                </span>
              </div>
              {modalReservation.guestInfo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">お客様</span>
                  <span className="font-medium text-gray-900">
                    {modalReservation.guestInfo.name}
                  </span>
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="space-y-3">
              {/* キャンセルボタン */}
              <button
                onClick={() => handleCancel(modalReservation.id)}
                disabled={isCancelling}
                // disabled = true のときボタンを押せなくする（二重送信防止）
                className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                // disabled:opacity-50        = 押せないとき半透明に
                // disabled:cursor-not-allowed = カーソルを禁止マークに
              >
                {isCancelling ? "キャンセル中..." : "この予約をキャンセルする"}
                {/* isCancelling 中はテキストを変えてフィードバック */}
              </button>

              {/* 閉じるボタン */}
              <button
                onClick={() => setModalReservation(null)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
