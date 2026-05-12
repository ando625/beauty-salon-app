// backend/src/prisma/prisma.module.ts

// Module = 「機能のまとめ役」を作るための部品
import { Module } from '@nestjs/common';

// さっき作ったPrismaServiceを読み込む
import { PrismaService } from './prisma.service';

@Module({
  // providers = 「このモジュールで使えるサービスを登録」
  // Laravelで言うとServiceProviderのregister()みたいな感じ
  providers: [PrismaService],

  // exports = 「他のモジュールにもこのサービスを貸し出す」
  // これを書かないと他のファイルからPrismaServiceが使えない！
  exports: [PrismaService],
})
export class PrismaModule {}