// frontend/src/app/api/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }

  const body = await request.json();
  const { password } = body;

  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { error: "パスワードを入力してください" },
      { status: 400 },
    );
  }

  // ----------------------------------------
  // 入力されたパスワードと環境変数のパスワードを
  // timingSafeEqual で比較する
  // 文字列の長さに関わらず一定時間で比較するので
  // タイミング攻撃を防げる
  // ----------------------------------------
  const crypto = await import("crypto");

  let isValid = false;
  try {
    // 両方を同じ長さのBufferに変換して比較
    const inputBuffer = Buffer.from(password);
    const storedBuffer = Buffer.from(process.env.ADMIN_PASSWORD);

    // 長さが違う場合はfalse（でも時間は同じかける）
    if (inputBuffer.length === storedBuffer.length) {
      isValid = crypto.timingSafeEqual(inputBuffer, storedBuffer);
    }
  } catch {
    isValid = false;
  }

  if (!isValid) {
    // ブルートフォース対策：1秒待つ
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json(
      { error: "パスワードが違います" },
      { status: 401 },
    );
  }

  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  return response;
}
