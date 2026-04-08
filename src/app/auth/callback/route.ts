import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { syncUserProfile } from "@/lib/user-profile";
import { ensurePersonalWorkspace } from "@/lib/workspaces";
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
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    if (data.user) {
      await syncUserProfile(data.user);
      await ensurePersonalWorkspace(data.user);
    }
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}
