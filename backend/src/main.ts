// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// ValidationPipe を追加で読み込む
// これがDTOのバリデーション（入力チェック）を動かすための部品
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    // ↑「localhost:3000（フロントエンド）からのアクセスを許可する」
    // これがないとブラウザがブロックする（さっきのCORSエラー）
  });

  // バリデーションを全体で有効にする
  // Laravelで言うと FormRequest が自動で動くようにする設定
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // ↑ DTOに定義していない余計なデータは自動で削除する
      // 例: DTOにないフィールドが送られてきても無視する（セキュリティ対策）

      forbidNonWhitelisted: true,
      // ↑ DTOにないフィールドが来たらエラーにする（より厳しいチェック）

      transform: true,
      // ↑ 受け取ったデータを自動でDTO型に変換する
      // 例: URLの "1"（文字列）→ 1（数値）に自動変換
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();