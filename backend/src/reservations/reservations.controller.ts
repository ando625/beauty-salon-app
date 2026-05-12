// reservations.controller.ts
// URLと処理を繋ぐ

// Controller = URLのルーティングを担当する部品
// Get = GETリクエストを受け取るための印
import { Controller, Get } from '@nestjs/common';

// さっき作ったReservationsServiceを読み込む
import { ReservationsService } from './reservations.service';

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
}