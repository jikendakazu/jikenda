"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "../lib/supabaseClient";

type Props = {
  className?: string;
  label?: string;
};

export default function LogoutButton({ className, label = "ログアウト" }: Props) {
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

    // 戻り先(next=)があれば尊重、なければ /login へ
    const next = search?.get("next") ?? "/login";
    router.replace(next);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={onLogout}
        disabled={loading}
        className={className}
        aria-busy={loading}
      >
        {loading ? "ログアウト中…" : label}
      </button>
      {msg && <p style={{ color: "crimson" }}>{msg}</p>}
    </>
  );
}
