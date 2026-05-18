// frontend/src/lib/api/menus.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// メニュー1件のデータの型定義
export type Menu = {
  id: number;
  name: string; // メニュー名（例：カット）
  price: number; // 料金（例：3000）
  duration: number; // 所要時間（分）（例：60）
  category: string; // カテゴリ（例：カット）
  isActive: boolean; // 表示中かどうか
};

// メニュー一覧を取得する関数
export const getMenus = async (): Promise<Menu[]> => {
  const res = await fetch(`${API_URL}/menus`);
  if (!res.ok) throw new Error("メニューの取得に失敗しました");
  return res.json();
};
