// reservations.service.ts
// BD処理を書く

// NestJSの「これはサービスだよ」という印
import { Injectable } from '@nestjs/common';

// さっき作ったPrismaServiceを読み込む
// これでDBが使えるようになる
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {

  // PrismaServiceを受け取る（依存性の注入）
  // 「このクラスはPrismaServiceを使いますよ」という宣言
  // NestJSが自動でPrismaServiceを渡してくれる（自分でnewしなくていい）
  // Laravelの __construct(private ReservationRepository $repo) と同じ考え方
  constructor(private readonly prisma: PrismaService) {}

  // 全予約を取得するメソッド
  // async/await = DBへの問い合わせは時間がかかるので「待つ」処理
  async findAll() {
    // Laravelの Reservation::all() と同じ意味
    return this.prisma.reservation.findMany();
  }
}