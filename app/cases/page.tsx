"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGate from "../components/AuthGate";
import { getBrowserSupabase } from "../lib/supabaseClient";

type CaseRow = {
  id: string;
  user_id: string;
  category: string | null;
  title: string | null;
  description: string | null;
  evidence: boolean | null;
  created_at: string;
};

export default function CasesPage() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const [category, setCategory] = useState("労働");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(false);
  const [rows, setRows] = useState<CaseRow[]>([]);

  useEffect(() => {
    if (!supabase) return;
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

  async function fetchCases() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setMsg(`Fetch error: ${error.message}`);
    if (data) setRows(data as CaseRow[]);
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
    if (!error) {
      setTitle(""); setDescription(""); setEvidence(false);
      fetchCases();
    }
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    location.href = "/login";
  }

  return (
    <AuthGate>
      <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
        <h1>Jikenda – 事案登録</h1>

        <p>
          ログイン中：{user?.email}{" "}
          <button onClick={signOut}>ログアウト</button>
        </p>

        <section style={{marginTop:16}}>
          <h2>事案登録フォーム</h2>
          <div style={{display:"grid",gap:8}}>
            <label>
              カテゴリ：
              <select value={category} onChange={e=>setCategory(e.target.value)}>
                <option>労働</option><option>離婚</option>
                <option>借金</option><option>交通事故</option><option>その他</option>
              </select>
            </label>
            <input placeholder="件名" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea rows={6} placeholder="相談内容" value={description} onChange={e=>setDescription(e.target.value)} />
            <label>
              <input type="checkbox" checked={evidence} onChange={e=>setEvidence(e.target.checked)} /> 証拠あり
            </label>
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

        <pre style={{whiteSpace:"pre-wrap"}}>{msg}</pre>
      </main>
    </AuthGate>
  );
}
