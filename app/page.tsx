"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../lib/supabaseClient";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");

  // すでにログイン済みならトップへ
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [supabase, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;

    setMsg("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("確認メールを送信しました。メール内のリンクを開いてください。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg("ログインしました。");
        router.replace("/"); // ログイン後にトップへ
      }
    } catch (err: any) {
      setMsg(err?.message ?? "エラーが発生しました");
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>ログイン / 新規登録</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setMode("signin")}
          aria-pressed={mode === "signin"}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            background: mode === "signin" ? "#eee" : "white",
          }}
        >
          ログイン
        </button>
        <button
          onClick={() => setMode("signup")}
          aria-pressed={mode === "signup"}
          style={{
            padding: "8px 12px",
            border: "1px solid #ddd",
            background: mode === "signup" ? "#eee" : "white",
          }}
        >
          新規登録
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          メールアドレス
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <label>
          パスワード
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 6 }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: "10px 14px",
            border: "1px solid #222",
            borderRadius: 6,
            background: "#222",
            color: "white",
            fontWeight: 600,
          }}
        >
          {mode === "signup" ? "新規登録" : "ログイン"}
        </button>
      </form>

      {msg && (
        <p style={{ marginTop: 16, color: "#444", whiteSpace: "pre-wrap" }}>
          {msg}
        </p>
      )}

      <p style={{ marginTop: 24 }}>
        戻る：<a href="/">トップへ</a>
      </p>
    </main>
  );
}
