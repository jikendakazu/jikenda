"use client";
export const dynamic = "force-dynamic";

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
  const [msg, setMsg] = useState("");

  // すでにログイン済みなら /cases へ
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/cases");
    });

    // ログイン/サインアップ完了時も即リダイレクト
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) router.replace("/cases");
    });

    return () => sub?.subscription.unsubscribe();
  }, [supabase, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setMsg("");

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg(error.message);
        return;
      }
      // 成功時は onAuthStateChange が /cases へ飛ばす（保険で下行）
      router.replace("/cases");
    } else {
      // サインアップ（メール確認が有効な場合、session は返らない）
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 確認メール内リンクの遷移先
          emailRedirectTo: `${location.origin}/login`,
        },
      });
      if (error) {
        setMsg(error.message);
        return;
      }
      if (!data.session) {
        setMsg("確認メールを送信しました。メール内のリンクを開いてから再度ログインしてください。");
      } else {
        router.replace("/cases");
      }
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1>ログイン / 新規登録</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setMode("signin")}
          style={{ padding: "8px 12px", background: mode === "signin" ? "#eee" : "transparent" }}
        >
          ログイン
        </button>
        <button
          onClick={() => setMode("signup")}
          style={{ padding: "8px 12px", background: mode === "signup" ? "#eee" : "transparent" }}
        >
          新規登録
        </button>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          メールアドレス
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </label>

        <label>
          パスワード
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </label>

        <button type="submit" style={{ padding: 12, background: "#222", color: "#fff" }}>
          {mode === "signin" ? "ログイン" : "新規登録"}
        </button>
      </form>

      <p style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{msg}</p>

      <p style={{ marginTop: 12 }}>
        <a href="/">トップへ戻る</a> / <a href="/cases">事案ページへ</a>
      </p>
    </main>
  );
}
