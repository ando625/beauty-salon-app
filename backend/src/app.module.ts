// app.module.ts（全体の司令塔）
// 全モジュールをここに登録 = Laravelのapp.phpに近い

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';


import { ReservationsModule } from './reservations/reservations.module';
import { StaffsModule } from './staffs/staffs.module';
import { MenusModule } from './menus/menus.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ReservationsModule,
    StaffsModule,
    MenusModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
