// backend/src/staffs/staffs.controller.ts

import { Controller, Get } from '@nestjs/common';
import { StaffsService } from './staffs.service';

// @Controller('staffs') = /staffs というURLを担当する
@Controller('staffs')
export class StaffsController {
  constructor(private readonly staffsService: StaffsService) {}

  // GET /staffs → スタッフ一覧を返す
  @Get()
  findAll() {
    return this.staffsService.findAll();
  }
}