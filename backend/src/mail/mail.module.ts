// backend/src/mail/mail.module.ts

import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  // providers = このモジュールで使える部品を登録
  exports: [MailService],
  // exports = 他のモジュールからも使えるように公開する
  // これがないと ReservationsModule から呼べない！
})
export class MailModule {}