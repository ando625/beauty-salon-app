// frontend/src/middleware.ts ↓変更
// frontend/src/proxy.ts

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
// jwtVerify = JWTトークンを検証する関数

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-secret-key",
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ログインページは認証不要（誰でもアクセスできる）
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // /admin から始まるURLを保護
  if (pathname.startsWith("/admin")) {
    // CookieからJWTトークンを取り出す
    const token = request.cookies.get("admin_token")?.value;
    // ?. = cookies.get() が undefined でもエラーにならない
    // .value = Cookie オブジェクトから値だけ取り出す

    // トークンがない場合はログインページへ
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // ----------------------------------------
      // JWTトークンを検証する
      // jwtVerify = トークンが
      //   ① 秘密鍵で正しく署名されているか
      //   ② 有効期限が切れていないか
      // を自動でチェックしてくれる
      // ----------------------------------------
      await jwtVerify(token, secret);

      // 検証OK → そのまま通過
      return NextResponse.next();
    } catch {
      // 検証失敗（改ざん・期限切れ）→ ログインページへ
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
