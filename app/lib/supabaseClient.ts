"use client";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // Vercelに入れた値を参照
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
