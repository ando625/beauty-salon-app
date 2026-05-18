// reservations.controller.ts
// URLと処理を繋ぐ

// Controller = URLのルーティングを担当する部品
// Get = GETリクエストを受け取るための印
import { Controller, Get, Post, Body, Query,Patch,Param, ParseIntPipe } from '@nestjs/common';
//   Post   = POSTリクエストを受け取る印
//   Body   = リクエストのbody（送られてきたデータ）を取り出す
//   Query  = URLの「?staffId=1&date=...」の部分を取り出す
//   ParseIntPipe = 文字列を数値に変換するパイプ（後述）


import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

// @Controller('reservations') = 「このクラスは /reservations というURLを担当する」
// Laravelの Route::prefix('reservations') みたいなイメージ
@Controller('reservations')
export class ReservationsController {
  // ReservationsServiceを受け取る（依存性の注入）
  // PrismaServiceの時と同じパターン！
  constructor(private readonly reservationsService: ReservationsService) {}

  // @Get() = 「GETリクエストが来たらこのメソッドを実行して」
  // @Controller('reservations') + @Get() = GET /reservations というURL
  // Laravelの Route::get('/reservations', [ReservationController::class, 'index']) と同じ
  @Get()
  findAll() {
    // ServiceのfindAll()を呼び出してDBから予約一覧を取得して返す
    return this.reservationsService.findAll();
  }

  // ===== 空き枠取得 =====
  // GET /reservations/slots?staffId=1&date=2025-06-01
  @Get('slots')
  getAvailableSlots(
    // @Query('staffId') = URLの?staffId=の値を取り出す
    // ParseIntPipe = 「文字列→数値」に変換するパイプ
    // URLは全部文字列で来るので "1" → 1 に変換が必要！
    @Query('staffId', ParseIntPipe) staffId: number,
    @Query('date') date: string,
  ) {
    return this.reservationsService.getAvailableSlots(staffId, date);
  }

  // ===== 予約作成 =====
  // POST /reservations
  @Post()
  create(
    // @Body() = リクエストのbodyを取り出してDTOの形に変換する
    // Laravelの $request->validated() と同じイメージ
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return this.reservationsService.create(createReservationDto);
  }

  // ===== キャンセル =====
  // PATCH /reservations/:id/cancel
  @Patch(':id/cancel')
  cancel(
    // @Param('id') = URLの :id の部分を取り出す
    // ParseIntPipe = 文字列 "1" を 数値 1 に変換
    @Param('id', ParseIntPipe) id: number,
  ) {
    // ServiceのcancelメソッドにIDを渡す
    return this.reservationsService.cancel(id);
  }
}