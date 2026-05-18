// frontend/src/app/reservations/new/page.tsx

"use client";
// ↑ これが超重要！
// 「このページはブラウザで動かすコンポーネントです」という宣言
// ボタンを押す・入力するなどユーザー操作があるページには必須
// ない場合 = サーバーコンポーネント（データ取得だけのページ）
// ある場合 = クライアントコンポーネント（操作があるページ）

// useStateとuseEffect はReactの「フック」
// useState  = 画面の状態（変数）を管理する
// useEffect = 特定のタイミングで処理を実行する
import { useState, useEffect } from "react";

// さっき作ったAPI関数と型を読み込む
import { getStaffs, Staff } from "@/lib/api/staffs";
import { getMenus, Menu } from "@/lib/api/menus";
import { getAvailableSlots, createReservation } from "@/lib/api/reservations";

// useRouter = ページ遷移をするための関数
// 予約完了後に完了ページへ飛ばすときに使う
import { useRouter } from "next/navigation";



export default function NewReservationPage() {
  // ===== useRouterの準備 =====
  const router = useRouter();
  // ↑ router.push('/xxx') でページ遷移できる

  // ===== useState で画面の状態を管理 =====
  // useState の書き方: const [値, 値を変える関数] = useState(初期値)
  // 例: staffs = スタッフ一覧データ / setStaffs = staffsを更新する関数

  // APIから取得したデータ
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // お客さんが選んだ値
  const [selectedStaffId, setSelectedStaffId] = useState<number>(0);
  // ↑ 初期値0 = 「誰でもいい」を最初から選択状態にする

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [selectedMenuIds, setSelectedMenuIds] = useState<number[]>([]);
  // ↑ 複数選択なので配列

  // 非会員用の入力フォーム
  const [guestName, setGuestName] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // 画面の状態管理
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // ↑ 送信中かどうか（trueのときはボタンをグレーにする）

  const [error, setError] = useState<string>("");
  // ↑ エラーメッセージ（空文字 = エラーなし）

  // ===== useEffect =====
  // useEffect の書き方:
  // useEffect(() => { 実行したい処理 }, [依存する値])
  // 依存する値が変わったときに処理が実行される
  // [] = 空配列 = ページが最初に表示されたときだけ実行

  // ページ読み込み時にスタッフとメニューを取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Promise.all = 2つのAPIを同時に呼ぶ（効率的！）
        // 1個ずつ await すると遅くなるので並行して実行
        const [staffsData, menusData] = await Promise.all([
          getStaffs(),
          getMenus(),
        ]);
        setStaffs(staffsData);
        setMenus(menusData);
      } catch (e) {
        setError("データの取得に失敗しました");
      }
    };
    fetchInitialData();
  }, []);
  // ↑ [] = ページ表示時に1回だけ実行

  // スタッフか日付が変わったら空き枠を再取得
  useEffect(() => {
    // どちらかが未選択なら何もしない
    if (!selectedDate) return;

    const fetchSlots = async () => {
      try {
        const data = await getAvailableSlots(selectedStaffId, selectedDate);
        setAvailableSlots(data.availableSlots);
        // 日付が変わったら時間枠の選択をリセット
        setSelectedTimeSlot("");
      } catch (e) {
        setError("空き枠の取得に失敗しました");
      }
    };
    fetchSlots();
  }, [selectedStaffId, selectedDate]);
  // ↑ selectedStaffId か selectedDate が変わるたびに実行



  // ===== メニューのチェックボックス処理 =====
  const handleMenuToggle = (menuId: number) => {
    // すでに選択済みなら外す、未選択なら追加する
    setSelectedMenuIds(
      (prev) =>
        // prev = 現在の selectedMenuIds の値
        prev.includes(menuId)
          ? prev.filter((id) => id !== menuId)
          : // ↑ includes = 含まれてるか確認。含まれてたら filter で除外
            [...prev, menuId],
      // ↑ 含まれてなかったら追加（スプレッド構文で配列をコピーして追加）
    );
  };

  // ===== 予約送信処理 =====
  const handleSubmit = async () => {
    // 必須項目のチェック
    if (!selectedDate || !selectedTimeSlot || selectedMenuIds.length === 0) {
      setError("日付・時間・メニューを選択してください");
      return;
      // ↑ return = ここで処理を止める
    }

    try {
      setIsLoading(true);
      // ↑ 送信中フラグをtrueに（ボタンが押せなくなる）

      setError("");
      // ↑ 前のエラーメッセージをクリア

      await createReservation({
        staffId: selectedStaffId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        menuIds: selectedMenuIds,
        guestName: guestName || undefined,
        // ↑ 空文字なら undefined にする（DTOの @IsOptional に合わせる）
        guestPhone: guestPhone || undefined,
        guestEmail: guestEmail || undefined,
        notes: notes || undefined,
      });

      // 予約完了後は完了ページへ遷移
      router.push("/reservations/complete");
      // ↑ router.push = Laravelの return redirect()->route('xxx') と同じ
    } catch (e) {
      setError("予約の作成に失敗しました。もう一度お試しください。");
    } finally {
      setIsLoading(false);
      // ↑ finally = 成功でも失敗でも必ず実行される
      // 送信中フラグを元に戻す
    }
  };

  // ===== JSX（画面のHTML部分）=====
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ページタイトル */}
        <h1 className="text-2xl font-bold text-gray-900 mb-8">ご予約</h1>

        {/* エラーメッセージ */}
        {error && (
          // error が空文字以外のときだけ表示
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ===== STEP1: スタッフ選択 ===== */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ① 担当スタッフを選んでください
          </h2>
          <div className="space-y-2">
            {/* 「誰でもいい」選択肢 */}
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              {/* label = クリックするとinputが反応するようにする */}
              <input
                type="radio"
                name="staff"
                value={0}
                checked={selectedStaffId === 0}
                onChange={() => setSelectedStaffId(0)}
                // ↑ onChange = 選択が変わったときに実行
                // setSelectedStaffId(0) = 選択値を0に更新
              />
              <span className="font-medium">誰でもいい（自動で割り当て）</span>
            </label>

            {/* スタッフ一覧をループで表示 */}
            {staffs.map((staff) => (
              <label
                key={staff.id}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="staff"
                  value={staff.id}
                  checked={selectedStaffId === staff.id}
                  onChange={() => setSelectedStaffId(staff.id)}
                />
                <span className="font-medium">{staff.user.name}</span>
                {staff.bio && (
                  <span className="text-sm text-gray-500">{staff.bio}</span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* ===== STEP2: 日付選択 ===== */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ② 日付を選んでください
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            // ↑ e.target.value = 入力された値を取り出す
            // Laravelのビューで言うと {{ old('date') }} に近い
            min={new Date().toISOString().split("T")[0]}
            // ↑ min = 今日より前の日付は選べないようにする
            // new Date().toISOString() = "2025-06-01T00:00:00.000Z"
            // .split('T')[0] = "2025-06-01" だけ取り出す
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </section>

        {/* ===== STEP3: 時間枠選択 ===== */}
        {/* selectedDate が選ばれてるときだけ表示 */}
        {selectedDate && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              ③ 時間を選んでください
            </h2>
            {availableSlots.length === 0 ? (
              <p className="text-gray-500">この日は空きがありません</p>
            ) : (
              <div className="flex gap-3 flex-wrap">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors
                      ${
                        selectedTimeSlot === slot
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                    // ↑ テンプレートリテラル（バッククォート）で
                    // 選択中かどうかによってクラスを切り替える
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ===== STEP4: メニュー選択 ===== */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ④ メニューを選んでください（複数選択可）
          </h2>
          <div className="space-y-2">
            {menus.map((menu) => (
              <label
                key={menu.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMenuIds.includes(menu.id)}
                    onChange={() => handleMenuToggle(menu.id)}
                    // ↑ チェックが変わったら handleMenuToggle を呼ぶ
                  />
                  <div>
                    <p className="font-medium">{menu.name}</p>
                    <p className="text-sm text-gray-500">{menu.duration}分</p>
                  </div>
                </div>
                <span className="font-medium text-gray-700">
                  ¥{menu.price.toLocaleString()}
                  {/* toLocaleString() = 3000 → "3,000" カンマ区切りにする */}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* ===== STEP5: お客さん情報 ===== */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ⑤ お客さま情報
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="山田 花子"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="090-1234-5678"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="hanako@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備考（任意）
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ご要望があればご記入ください"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </section>

        {/* ===== 送信ボタン ===== */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          // ↑ disabled = trueのときボタンが押せなくなる
          className={`w-full py-4 rounded-lg font-bold text-white text-lg transition-colors
            ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {isLoading ? "送信中..." : "予約を確定する"}
          {/* isLoading が true のとき「送信中...」と表示 */}
        </button>
      </div>
    </div>
  );
}