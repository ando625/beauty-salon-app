// backend/src/menus/menus.controller.ts

import { Controller, Get } from '@nestjs/common';
import { MenusService } from './menus.service';

// @Controller('menus') = /menus というURLを担当する
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  // GET /menus → メニュー一覧を返す
  @Get()
  findAll() {
    return this.menusService.findAll();
  }
}