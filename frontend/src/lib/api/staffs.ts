// frontend/src/lib/api/staffs.ts

// APIのベースURL（ブラウザ側からアクセスするので NEXT_PUBLIC_ を使う）
// サーバーコンポーネントと違い、フォームはブラウザで動くため
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// スタッフ1件のデータの型定義
export type Staff = {
  id: number;
  userId: number;
  bio: string | null; // 「| null」= nullの可能性がある
  user: {
    id: number;
    name: string;
    email: string;
  };
};

// スタッフ一覧を取得する関数
export const getStaffs = async (): Promise<Staff[]> => {
  const res = await fetch(`${API_URL}/staffs`);
  if (!res.ok) throw new Error("スタッフの取得に失敗しました");
  return res.json();
};
