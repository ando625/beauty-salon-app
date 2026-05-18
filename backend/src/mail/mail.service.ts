// backend/src/mail/mail.service.ts

import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
// Resend = インストールしたメール送信ライブラリ

@Injectable()
export class MailService {
  // Resendのインスタンスを作る
  // process.env.RESEND_API_KEY = .envに書いたAPIキー
  private resend = new Resend(process.env.RESEND_API_KEY);

  // ----------------------------------------
  // お客さんへの予約確認メールを送る
  // ----------------------------------------
  async sendCustomerConfirmation(params: {
    to: string;        // 送り先メールアドレス
    guestName: string; // お客さんの名前
    date: string;      // 予約日（例：2026-05-21）
    timeSlot: string;  // 時間（例：15:00）
    menuNames: string[]; // メニュー名の配列
    staffName: string;   // スタッフ名
  }) {
    const { to, guestName, date, timeSlot, menuNames, staffName } = params;

    // 日付を読みやすい形式に変換
    // 例：'2026-05-21' → '2026年5月21日'
    const formattedDate = new Date(date.replaceAll('-', '/'))
      .toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });

    // メニュー名を '・' でつなげる
    // 例：['カット', 'カラー'] → 'カット・カラー'
    const menuText = menuNames.join('・');

    // Resendでメールを送信する
    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      // ↑ Resendの無料プランではこのアドレスしか使えない
      //   独自ドメインを設定すれば変更できる

      to,
      // ↑ お客さんのメールアドレス

      subject: '【予約確認】ご予約ありがとうございます',

      // html = メールの本文（HTML形式で書ける）
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #10b981;">予約確認メール</h2>
          <p>${guestName} 様</p>
          <p>以下の内容でご予約を承りました。</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">日時</td>
              <td style="padding: 8px; font-weight: bold;">${formattedDate} ${timeSlot}〜</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">担当スタッフ</td>
              <td style="padding: 8px;">${staffName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">メニュー</td>
              <td style="padding: 8px;">${menuText}</td>
            </tr>
          </table>

          <p style="color: #6b7280; font-size: 14px;">
            ご不明な点はお気軽にお問い合わせください。
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            ※ このメールは自動送信されています。
          </p>
        </div>
      `,
    });
  }

  // ----------------------------------------
  // スタッフへの新規予約通知メールを送る
  // ----------------------------------------
  async sendStaffNotification(params: {
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    date: string;
    timeSlot: string;
    menuNames: string[];
    staffName: string;
  }) {
    const {
      guestName, guestPhone, guestEmail,
      date, timeSlot, menuNames, staffName
    } = params;

    const formattedDate = new Date(date.replaceAll('-', '/'))
      .toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });

    const menuText = menuNames.join('・');

    // SALON_EMAIL = .envに書いたサロンのメールアドレス
    const salonEmail = process.env.SALON_EMAIL ?? 'salon@example.com';

    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: salonEmail,
      subject: `【新規予約】${formattedDate} ${timeSlot} ${guestName}様`,

      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #6366f1;">新規予約が入りました</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">お客様名</td>
              <td style="padding: 8px; font-weight: bold;">${guestName} 様</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">電話番号</td>
              <td style="padding: 8px;">${guestPhone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">メールアドレス</td>
              <td style="padding: 8px;">${guestEmail}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">日時</td>
              <td style="padding: 8px; font-weight: bold;">${formattedDate} ${timeSlot}〜</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">担当スタッフ</td>
              <td style="padding: 8px;">${staffName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #6b7280;">メニュー</td>
              <td style="padding: 8px;">${menuText}</td>
            </tr>
          </table>
        </div>
      `,
    });
  }
}