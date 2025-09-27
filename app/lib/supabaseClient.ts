"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * ブラウザ実行時にのみ Supabase クライアントを生成する。
 * ビルド時(サーバ)は生成しないので、環境変数未定義でも落ちない。
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null; // SSR/ビルド時は何もしない
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    // ブラウザで本当に無い場合だけ明示エラー
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, anon);
}
