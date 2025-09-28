"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "../lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onLogout() {
    if (loading) return;
    setLoading(true);
    setMsg("");

    const { error } = await supabase.auth.signOut();
    if (error) {
      setMsg(`エラー: ${error.message}`);
      setLoading(false);
      return;
    }
    const next = search?.get("next") ?? "/login";
    router.replace(next);
    router.refresh();
  }

  return (
    <>
      <button onClick={onLogout} disabled={loading}>
        {loading ? "ログアウト中…" : "ログアウト"}
      </button>
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}
    </>
  );
}
