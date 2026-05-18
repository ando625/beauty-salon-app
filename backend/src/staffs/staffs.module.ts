// backend/src/staffs/staffs.module.ts

import { Module } from '@nestjs/common';
import { StaffsController } from './staffs.controller';
import { StaffsService } from './staffs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // PrismaServiceを借りてくる
  controllers: [StaffsController], // URL担当を登録
  providers: [StaffsService], // 処理担当を登録
})
export class StaffsModule {}