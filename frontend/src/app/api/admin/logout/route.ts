// frontend/src/app/api/admin/logout/route.ts

import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Cookieを削除することでログアウト
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
    // ↑ maxAge: 0 = 即座に削除
  });

  return response;
}
