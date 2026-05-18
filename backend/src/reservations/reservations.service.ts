// backend/src/reservations/reservations.service.ts
// PrismaでDB操作（Eloquentの代わり）

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateReservationDto } from './dto/create-reservation.dto';

import { MailService } from '../mail/mail.service';

// 固定時間枠の定義
// ここを変えるだけで営業時間を変えられる
const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

@Injectable()
export class ReservationsService {
  // PrismaServiceを受け取る（依存性の注入）
  // 「このクラスはPrismaServiceを使いますよ」という宣言
  // NestJSが自動でPrismaServiceを渡してくれる（自分でnewしなくていい）
  // Laravelの __construct(private ReservationRepository $repo) と同じ考え方
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // 全予約を取得するメソッド
  // async/await = DBへの問い合わせは時間がかかるので「待つ」処理
  async findAll() {
    return this.prisma.reservation.findMany({
      // ----------------------------------------
      // include = 「関連するテーブルも一緒に取ってきて」
      // Laravelの with('staff', 'menus') と同じ考え方
      // ----------------------------------------
      include: {
        // staff → StaffProfile テーブル
        // さらにその中の user → User テーブルまで掘り下げる
        // 2段階ネストが必要な理由：
        //   StaffProfile には名前がなく、User に名前がある
        staff: {
          include: {
            user: true,
            // ↑ user: true = Userテーブルの情報も全部含めて
            // これで staff.user.name が取れるようになる
          },
        },

        // メニュー情報を含める
        // reservationMenus = 予約とメニューをつなぐ中間テーブル
        // そのまま取るとメニューIDしかないので、
        // さらに menu テーブルまで掘り下げる
        reservationMenus: {
          include: {
            menu: true,
            // ↑ menu: true = Menuテーブルの情報も全部含めて
            // これで reservationMenus[0].menu.name が取れる
          },
        },

        // 非会員情報を含める（会員予約の場合はnullになる）
        guestInfo: true,
        // ↑ true だけでOK。これ以上掘り下げる必要がないから
      },
    });
  }

  // ===== 空き枠を返すメソッド =====
  // staffId = スタッフのID（0なら「誰でもいい」）
  // date    = 予約したい日付（例: "2025-06-01"）
  async getAvailableSlots(staffId: number, date: string) {

    // 日付の文字列をJavaScriptのDateオブジェクトに変換する
    // 例: "2025-06-01" → Date型
    // その日の開始（00:00:00）と終了（23:59:59）を作る
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    // ↑「その日の0時0分0秒にセットして」という命令

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    // ↑「その日の23時59分59秒にセットして」という命令

    // その日・そのスタッフの予約済み枠をDBから取得
    const existingReservations = await this.prisma.reservation.findMany({
      where: {
        // date が startOfDay〜endOfDay の間のデータを取得
        date: {
          gte: startOfDay, // gte = greater than or equal = 以上
          lte: endOfDay, // lte = less than or equal    = 以下
        },
        // CANCELLEDの予約は除外（キャンセルされた枠は空きとして扱う）
        status: 'CONFIRMED',
        // staffId = 0 は「誰でもいい」なのでフィルターしない
        ...(staffId !== 0 && { staffId }),
        // ↑「staffIdが0じゃない場合だけ、staffIdの条件を追加して」
        // 「...」はスプレッド構文 = オブジェクトを展開する記法
      },
    });

    // 既に予約済みの時間枠だけ取り出す
    // map = 配列を別の形に変換する
    // 例: [{timeSlot: "10:00", ...}, {timeSlot: "13:00", ...}]
    //   → ["10:00", "13:00"]
    const bookedSlots = existingReservations.map((r) => r.timeSlot);

    // 全時間枠から予約済みの枠を除いて返す
    // filter = 条件に合うものだけ残す
    // includes = 配列の中にその値が含まれているか確認する
    // !bookedSlots.includes(slot) = 「予約済みリストに含まれていない枠だけ残す」
    const availableSlots = TIME_SLOTS.filter(
      (slot) => !bookedSlots.includes(slot),
    );

    // 例: TIME_SLOTS = ["10:00", "13:00", "15:00"]
    //     bookedSlots = ["13:00"]
    //     availableSlots = ["10:00", "15:00"] ← これを返す

    return {
      date,
      staffId,
      availableSlots,
    };
  }

  // ===== 予約を作るメソッド =====
  async create(dto: CreateReservationDto) {
    // 「誰でもいい」(staffId=0)の場合、自動でスタッフを割り当てる
    let assignedStaffId = dto.staffId;
    // ↑ let = 後で値を変えることができる変数宣言

    if (dto.staffId === 0) {
      // その日・その時間に空いているスタッフを探す
      assignedStaffId = await this.autoAssignStaff(dto.date, dto.timeSlot);
    }

    // Prismaで予約をDBに保存する
    // Laravelの Reservation::create([...]) と同じ意味
    const reservation = await this.prisma.reservation.create({
      data: {
        userId: dto.userId ?? null,
        // ↑「??」= nullish合体演算子。dto.userIdがundefinedかnullなら null にする

        staffId: assignedStaffId,
        date: new Date(dto.date),
        // ↑ 文字列 "2025-06-01" を Date型に変換

        timeSlot: dto.timeSlot,
        status: 'CONFIRMED',
        // ↑ 予約した瞬間に確定！

        notes: dto.notes ?? null,

        // メニューとの紐付け（中間テーブル ReservationMenu に保存）
        reservationMenus: {
          create: dto.menuIds.map((menuId) => ({ menuId })),
          // ↑ menuIds = [1, 3] なら
          //   [{ menuId: 1 }, { menuId: 3 }] を作って一気に保存
        },

        // 非会員情報がある場合のみ保存
        ...(dto.guestName && {
          guestInfo: {
            create: {
              name: dto.guestName,
              phone: dto.guestPhone ?? '',
              email: dto.guestEmail ?? '',
            },
          },
        }),
      },
      // 保存したデータに加えて、関連するメニュー情報も一緒に返す
      include: {
        reservationMenus: {
          include: { menu: true },
          // ↑ メニューの詳細情報も含めて返す
        },
        guestInfo: true,
      },
    });
    // ----------------------------------------
    // メール送信処理
    // ----------------------------------------
    // スタッフ名を取得する
    // assignedStaffId でスタッフを検索してユーザー名を取る
    const staffProfile = await this.prisma.staffProfile.findUnique({
      where: { id: assignedStaffId },
      include: { user: true },
      // ↑ staffProfile に紐づく user も一緒に取得
    });
    const staffName = staffProfile?.user.name ?? '担当スタッフ';

    // メニュー名の配列を作る
    // 例：[{ menu: { name: 'カット' } }] → ['カット']
    const menuNames = reservation.reservationMenus.map(
      (rm) => rm.menu.name
    );

    // ゲスト情報がある場合（非会員予約）だけメールを送る
    if (dto.guestEmail) {
      // お客さんへの確認メール
      // await をつけないことで「送信完了を待たずに処理を続ける」
      // メール送信に時間がかかっても予約完了のレスポンスが遅れない
      this.mailService.sendCustomerConfirmation({
        to: dto.guestEmail,
        guestName: dto.guestName ?? 'お客様',
        date: dto.date,
        timeSlot: dto.timeSlot,
        menuNames,
        staffName,
      }).catch((err) => {
        // エラーが起きてもログに出すだけ（予約自体は成功している）
        console.error('お客様へのメール送信失敗:', err);
      });

      // スタッフへの通知メール
      this.mailService.sendStaffNotification({
        guestName: dto.guestName ?? 'お客様',
        guestPhone: dto.guestPhone ?? '',
        guestEmail: dto.guestEmail,
        date: dto.date,
        timeSlot: dto.timeSlot,
        menuNames,
        staffName,
      }).catch((err) => {
        console.error('スタッフへのメール送信失敗:', err);
      });
    }

    return reservation;
  }

  // ===== 内部処理: スタッフ自動割り当て =====
  // private = このクラスの中からしか呼べないメソッド
  private async autoAssignStaff(date: string, timeSlot: string): Promise<number> {

    // 全スタッフを取得
    const allStaff = await this.prisma.staffProfile.findMany();

    if (allStaff.length === 0) {
      // スタッフが1人もいない場合はエラー
      throw new Error('利用可能なスタッフがいません');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 各スタッフの「その日の予約数」を数えて、
    // 一番少ないスタッフに割り当てる
    const staffWithCounts = await Promise.all(
      // Promise.all = 複数の非同期処理を並行して実行する
      // 全スタッフ分のDB検索を同時に走らせる（効率的！）
      allStaff.map(async (staff) => {
        const count = await this.prisma.reservation.count({
          where: {
            staffId: staff.id,
            date: { gte: startOfDay, lte: endOfDay },
            timeSlot, // 同じ時間枠に既に入っていないかも確認
            status: 'CONFIRMED',
          },
        });
        return { staffId: staff.id, count };
        // 例: { staffId: 1, count: 2 } = スタッフ1は今日2件予約あり
      }),
    );

    // 予約数が0のスタッフだけ残す（その時間に空いているスタッフ）
    const availableStaff = staffWithCounts.filter((s) => s.count === 0);

    if (availableStaff.length === 0) {
      throw new Error('指定の時間に空いているスタッフがいません');
    }

    // 空いているスタッフの中で、その日の総予約数が一番少ない人を選ぶ
    // sort = 並び替え。count の小さい順に並べる
    availableStaff.sort((a, b) => a.count - b.count);

    // 一番少ない人（先頭）のstaffIdを返す
    return availableStaff[0].staffId;
  }


  // ===== 予約キャンセル =====
  // id = キャンセルする予約のID
  async cancel(id: number) {
    // Prismaで予約のstatusを CANCELLED に更新する
    // Laravelの Reservation::find($id)->update(['status' => 'CANCELLED']) と同じ
    return this.prisma.reservation.update({
      where: { id },
      // where: { id } は where: { id: id } の省略形
      // 「idがこの値のレコードを対象に」

      data: {
        status: 'CANCELLED',
        // DBから削除しない！statusを変えるだけ
      },
    });
  }
}