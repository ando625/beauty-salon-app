// reservations.module.ts
// ２つをまとめて登録　「予約機能の部品をまとめた箱」Controller・Serviceをここに登録して使えるようにする

import { Module } from '@nestjs/common';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';


@Module({
  // imports = 「他のモジュールの機能を借りてくる」
  // PrismaModuleをimportすることでPrismaServiceが使えるようになる
  imports: [
    PrismaModule,
    MailModule,
  ],

  // controllers = 「このモジュールのURLルーティング担当を登録」
  controllers: [ReservationsController],

  // providers = 「このモジュールで使うサービスを登録」
  providers: [ReservationsService],
})
export class ReservationsModule {}