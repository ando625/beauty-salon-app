// backend/src/prisma/prisma.service.ts

// NestJSの部品をインポート
// Injectable = 「他のファイルから使えるようにして」
// OnModuleInit = 「NestJSが起動した時に自動で動く処理を書けるよ」

import { Injectable, OnModuleInit } from '@nestjs/common';

// PrismaClientをインポート（prismaが自動生成したDB操作ツール）
// Laravelで言うとEloquentのベースクラスみたいなもの

import { PrismaClient } from '@prisma/client';

// PrismaClientを「継承」する = PrismaClientの全機能をそのまま使える
// Laravelで言うと class ReservationRepository extends Model みたいな感じ
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // NestJSが起動した時に自動で実行される
  // 「アプリが始まったらDBに接続して」という命令
  async onModuleInit() {
    await this.$connect();
  }
}