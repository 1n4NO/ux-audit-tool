import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const nextPath = requestUrl.searchParams.get("next") || "/";
  const code = requestUrl.searchParams.get("code");

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
