//backend/src/staffs/staffs.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffsService {
  constructor(private readonly prisma: PrismaService) {}

  // 全スタッフを取得する
  // StaffProfileテーブルからuserの名前も一緒に取得する
  async findAll() {
    return this.prisma.staffProfile.findMany({
      // include = 「関連するテーブルのデータも一緒に取ってきて」
      // LaravelのEagerLoading（with()）と同じ！
      // staffProfile.findMany() だけだと名前が取れないので
      // Userテーブルの name も一緒に取得する
      include: {
        user: {
          select: {
            // select = 「このカラムだけ取ってきて」
            // パスワードなど不要なものは取らない（セキュリティ対策）
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}