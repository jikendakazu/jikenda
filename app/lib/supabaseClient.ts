"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ブラウザでのみ Supabase クライアントを作成して返す。
 * （サーバー側のビルド/プリレンダー中に createClient が走らないように）
 */
export function getBrowserSupabase(): SupabaseClient {
  // クライアントサイド環境でのみ評価
  if (typeof window === "undefined") {
    // ここでは絶対に createClient を呼ばない
    throw new Error("getBrowserSupabase() must be called in the browser");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // ここで throw すれば、原因がログに明示されます
    throw new Error(
      `Missing Supabase env. URL set? ${!!url}, ANON set? ${!!anon}`
    );
  }

  return createClient(url, anon);
}
