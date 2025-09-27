"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

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

  // フォーム状態
  const [category, setCategory] = useState("労働");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(false);
  const [rows, setRows] = useState<CaseRow[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCases();
      else setRows([]);
    });
    fetchCases();
    return () => sub?.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setMsg("ログアウトしました");
  }

  async function submitCase() {
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
    if (!user) return;
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRows(data as CaseRow[]);
  }

  return (
    <main>
      <h1>Jikenda – 事案登録</h1>

      {!user ? (
        <p>
          まずは <a href="/login">ログイン / 新規登録</a> してください。
        </p>
      ) : (
        <>
          <p>
            ログイン中：{user.email}{" "}
            <button onClick={signOut}>ログアウト</button>
          </p>

          <section style={{marginTop:16}}>
            <h2>事案登録フォーム</h2>
            <div style={{display:"grid",gap:8,maxWidth:640}}>
              <label>
                カテゴリ：
                <select value={category} onChange={e=>setCategory(e.target.value)}>
                  <option>労働</option><option>離婚</option>
                  <option>借金</option><option>交通事故</option><option>その他</option>
                </select>
              </label>
              <input placeholder="件名" value={title} onChange={e=>setTitle(e.target.value)} />
              <textarea rows={6} placeholder="相談内容" value={description} onChange={e=>setDescription(e.target.value)} />
              <label><input type="checkbox" checked={evidence} onChange={e=>setEvidence(e.target.checked)} /> 証拠あり</label>
              <button onClick={submitCase}>送信</button>
            </div>
          </section>

          <section style={{marginTop:24}}>
            <h2>あなたの事案</h2>
            {rows.length === 0 ? <p>まだ登録がありません。</p> : (
              <ul>
                {rows.map(r => (
                  <li key={r.id} style={{marginBottom:12}}>
                    <b>[{r.category}] {r.title ?? "(無題)"} </b><br/>
                    <small>{new Date(r.created_at).toLocaleString("ja-JP")}</small>
                    <div>{r.description}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <pre style={{whiteSpace:"pre-wrap"}}>{msg}</pre>
    </main>
  );
}
