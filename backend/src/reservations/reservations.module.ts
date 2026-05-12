// reservations.module.ts
// ２つをまとめて登録

import { Module } from '@nestjs/common';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  // imports = 「他のモジュールの機能を借りてくる」
  // PrismaModuleをimportすることでPrismaServiceが使えるようになる
  imports: [PrismaModule],

  // controllers = 「このモジュールのURLルーティング担当を登録」
  controllers: [ReservationsController],

  // providers = 「このモジュールで使うサービスを登録」
  providers: [ReservationsService],
})
export class ReservationsModule {}