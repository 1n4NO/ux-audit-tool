"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv, hasSupabaseEnv } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseBrowserClient() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  if (!browserClient) {
    const { url, anonKey } = getSupabaseEnv();
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
}
