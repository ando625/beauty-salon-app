// backend/src/reservations/dto/create-reservation.dto.ts

// DTO = Data Transfer Object（データ転送オブジェクト）
// 「APIに送られてくるデータはこの形ですよ」という設計図
// Laravelの FormRequest クラスと同じ役割！

// IsString, IsInt, IsArray など = 「この値は〇〇型でなければならない」というルール
// NestJSのバリデーション（入力チェック）ライブラリ
import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateReservationDto {
  // お客さんのID（会員の場合のみ。非会員はnull）
  // @IsOptional() = 「なくてもOK」という意味
  @IsOptional()
  @IsInt() // 整数でなければならない
  userId?: number; // 「?」= TypeScriptでも省略可能という意味

  // 担当スタッフのID
  // 「誰でもいい」の場合は0を送る（後で自動割り当て処理をする）
  @IsInt()
  staffId: number;

  // 予約日（例: "2025-06-01"）
  // @IsDateString() = 「日付の文字列形式でなければならない」
  @IsDateString()
  date: string;

  // 時間枠（例: "10:00"）
  @IsString()
  timeSlot: string;

  // 選んだメニューのID一覧（複数選択可）
  // 例: [1, 3] = メニューIDが1番と3番を選んだ
  // @IsArray() = 「配列でなければならない」
  @IsArray()
  menuIds: number[];

  // 備考（任意）
  @IsOptional()
  @IsString()
  notes?: string;

  // ===== 非会員用の情報（会員の場合はすべてnull） =====

  // 非会員の名前
  @IsOptional()
  @IsString()
  guestName?: string;

  // 非会員の電話番号
  @IsOptional()
  @IsString()
  guestPhone?: string;

  // 非会員のメールアドレス
  @IsOptional()
  @IsString()
  guestEmail?: string;
}