"use client";

import { useMemo, useState } from "react";
import { getBrowserSupabase } from "../lib/supabaseClient";

export default function LogoutButton() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onLogout() {
    // SSR/ビルド中は supabase が null のことがあるので必ずガード
    if (!supabase) {
      setMsg("クライアント初期化中です。少し待って再度お試しください。");
      return;
    }

    setLoading(true);
    setMsg("");

    const { error } = await supabase.auth.signOut();
    if (error) {
      setMsg(`エラー: ${error.message}`);
    } else {
      setMsg("ログアウトしました");
      // 必要なら画面遷移
      try {
        window.location.href = "/login";
      } catch {}
    }
    setLoading(false);
  }

  return (
    <span>
      <button onClick={onLogout} disabled={loading || !supabase}>
        {loading ? "処理中…" : "ログアウト"}
      </button>
      {msg && <small style={{ marginLeft: 8 }}>{msg}</small>}
    </span>
  );
}
