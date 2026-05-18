// backend/prisma/seed.ts

// seed = 「種を蒔く」という意味
// DBにテスト用の初期データを入れるためのファイル
// Laravelの DatabaseSeeder.php と同じ役割！

import { PrismaClient } from '@prisma/client';

// bcrypt = パスワードを暗号化するライブラリ
// 「password123」→「$2b$10$xxxxx...」という形に変換する
import * as bcrypt from 'bcrypt';

// PrismaClientのインスタンスを作る
// インスタンス = 「Prismaを使う準備ができた道具」
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータを投入中...');

  // ===== スタッフユーザーを2人作る =====

  // パスワードを暗号化する
  // 10 = ハッシュの強度（大きいほど安全だが遅い）
  const hashedPassword = await bcrypt.hash('password123', 10);

  // upsert = 「あれば更新・なければ作成」
  // Laravelの updateOrCreate() と同じ！
  // 何度シードを実行しても重複しないようにする
  const staff1 = await prisma.user.upsert({
    where: { email: 'yamada@salon.com' },
    // ↑ このメールアドレスのユーザーを探す
    update: {},
    // ↑ 既にあった場合は何も更新しない
    create: {
      // ↑ なかった場合は新しく作る
      email: 'yamada@salon.com',
      password: hashedPassword,
      name: '山田 美咲',
      role: 'STAFF',
      // ↑ 役割をSTAFFに設定
      staffProfile: {
        create: {
          bio: 'カラーが得意です！明るい雰囲気が好評です😊',
        },
        // ↑ Userを作ると同時にStaffProfileも作る
        // LaravelのhasOneを使ったcreateと同じイメージ
      },
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: 'suzuki@salon.com' },
    update: {},
    create: {
      email: 'suzuki@salon.com',
      password: hashedPassword,
      name: '鈴木 健太',
      role: 'STAFF',
      staffProfile: {
        create: {
          bio: 'カットのスペシャリスト！骨格に合わせたスタイルを提案します',
        },
      },
    },
  });

  console.log('✅ スタッフ作成完了:', staff1.name, staff2.name);

  // ===== メニューを4つ作る =====

  // upsert = 「あれば更新・なければ作成」
  // name で検索して、なければ作る
  // これで何度シードを実行しても重複しない！
  // ※ createMany の skipDuplicates は @unique がないと効かないので
  //   upsert に変更した
  const menuData: {
    id: number;
    name: string;
    price: number;
    duration: number;
    category: string;
  }[] = [
    { id: 1, name: 'カット',        price: 4000, duration: 60,  category: 'カット' },
    { id: 2, name: 'カラー',        price: 7000, duration: 90,  category: 'カラー' },
    { id: 3, name: 'パーマ',        price: 8000, duration: 120, category: 'パーマ' },
    { id: 4, name: 'トリートメント', price: 3000, duration: 30,  category: 'トリートメント' },
  ];

  for (const menu of menuData) {
    // for...of = 配列を1件ずつ処理する
    // 例：menuData の カット → カラー → パーマ → トリートメント の順に処理
    await prisma.menu.upsert({
      where: { id: menu.id },
      // ↑ この名前のメニューを探す
      // ※ schema.prisma の Menu モデルに @unique が必要
      update: {
        // 既にあった場合は価格・時間を最新に更新する
        name: menu.name,
        price: menu.price,
        duration: menu.duration,
      },
      create: {
        // なかった場合は新しく作る
        ...menu,
        // ↑ menu オブジェクトの全フィールドを展開して渡す
        // { name, price, duration, category } が全部入る
        isActive: true,
      },
    });
  }

  console.log('✅ メニュー作成完了');
  console.log('🎉 シード完了！');
}

// main関数を実行して、終わったらDB接続を切る
main()
  .catch((e) => {
    console.error('❌ シードエラー:', e);
    process.exit(1);
    // ↑ process.exit(1) = エラーで終了（1 = 異常終了）
  })
  .finally(async () => {
    await prisma.$disconnect();
    // ↑ DBとの接続を切る（後片付け）
  });