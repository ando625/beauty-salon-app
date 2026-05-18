// backend/src/menus/menus.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  // 有効なメニューだけ取得する
  async findAll() {
    return this.prisma.menu.findMany({
      where: {
        isActive: true,
        // ↑ isActive = true のものだけ取得
        // 非表示にしたメニューはお客さんに見せない
      },
      // 料金が安い順に並べる
      orderBy: {
        price: 'asc',
        // ↑ asc = ascending = 昇順（小さい順）
        // desc = descending = 降順（大きい順）
      },
    });
  }
}