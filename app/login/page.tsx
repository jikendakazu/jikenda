"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "../lib/supabaseClient"; // ← 相対パスはこのままでOK

type CaseRow = {
  id: string;
  category: string | null;
  title: string | null;
  description: string | null;
  evidence: boolean | null;
  created_at: string;
};

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState("");

  // ブラウザでだけクライアント生成
  const supabase = useMemo(() => getBrowserSupabase(), []);

  const [category, setCategory] = useState("労働");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(false);
  const [rows, setRows] = useState<CaseRow[]>([]);

  useEffect(() => {
    if (!supabase) return; // SSR/ビルド時は何もしない
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCases();
      else setRows([]);
    });
    fetchCases();
    return () => sub?.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMsg("ログアウトしました");
  }

  async function submitCase() {
    if (!supabase) return;
    if (!user) { setMsg("ログインしてください"); return; }
    setMsg("");
    const payload = {
      user_id: user.id,
      category,
      title: title || null,
      description: description || null,
      evidence
    };
    const { error } = await supabase.from("cases").insert(payload);
    setMsg(error ? `Insert error: ${error.message}` : "登録しました");
    if (!error) { setTitle(""); setDescription(""); setEvidence(false); fetchCases(); }
  }

  async function fetchCases() {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRows(data as CaseRow[]);
  }

  return (
    // 以降はそのまま
    <main>
      <h1>Jikenda – 事案登録</h1>
      {!user ? (
        <p>まずは <a href="/login">ログイン / 新規登録</a> してください。</p>
      ) : (
        <>
          <p>ログイン中：{user?.email} <button onClick={signOut}>ログアウト</button></p>
          {/* フォームと一覧は既存コードのままでOK */}
          {/* ... */}
        </>
      )}
      <pre style={{whiteSpace:"pre-wrap"}}>{msg}</pre>
    </main>
  );
}
