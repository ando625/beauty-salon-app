// src/components/reservations/ReservationCard.tsx

import { Reservation } from "@/lib/api/reservations";

type ReservationCardProps = {
  reservation: Reservation;
};

// ステータスに応じて「左の色線」のクラスを返す関数
// 引数: status = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
// 返り値: Tailwindのクラス名（文字列）
function getStatusBorderColor(status: string): string{
  switch (status) {
    case 'CONFIRMED':
      return 'border-1-green-500';
    case 'PENDING':
      return 'border-1-yellow-500';
    case 'CANCELLED':
      return 'border-1-red-500';
    default:
      return 'border-1-gray-300';
  }
}


// ステータスに応じて「バッジの色」のクラスを返す関数
function getStatusBadgeStyle(status: string): string {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';   // 緑背景・緑文字
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'; // 黄背景・黄文字
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';       // 赤背景・赤文字
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// ステータスの英語を日本語に変換する関数
function getStatusLabel(status: string): string{
  switch (status) {
    case "CONFIRMED":
      return "確認済み";
    case "PENDING":
      return "保留中";
    case "CANCELLED":
      return "キャンセル";
    default: return status;
  }
}