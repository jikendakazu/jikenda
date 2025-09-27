"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** ブラウザでだけ Supabase クライアントを返す。SSR時は null */
export function getBrowserSupabase() {
  if (typeof window === "undefined") return null; // SSR/ビルドでは実行しない
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) throw new Error("supabaseUrl is required.");

  client = createClient(url, key);
  return client;
}
