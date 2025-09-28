"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "../lib/supabaseClient"; // 相対パスは /cases から見て ../lib
import LogoutButton from "../components/LogoutButton";

type CaseRow = {
  id: string;
  category: string | null;
  title: string | null;
  description: string | null;
  evidence: boolean | null;
  created_at: string;
};

<p style={{ marginTop: 8 }}>
  <a href="/cases/new">事件を新規作成</a>
</p>




export default function CasesPage() {
  const supabase = useMemo(() => getBrowserSupabase(), []);

  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState("");

  // フォーム状態
  const [category, setCategory] = useState("労働");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(false);

  // 一覧
  const [rows, setRows] = useState<CaseRow[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchCases();
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
    if (!error && data) setRows(data as CaseRow[]);
  }

  async function submitCase() {
    if (!supabase) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setMsg("ログインしてください");
      return;
    }
    setMsg("");

    const payload = {
      user_id: u.user.id,
      category,
      title: title || null,
      description: description || null,
      evidence,
    };

    const { error } = await supabase.from("cases").insert(payload);
    if (error) {
      setMsg(`Insert error: ${error.message}`);
      return;
    }
    setMsg("登録しました");
    setTitle("");
    setDescription("");
    setEvidence(false);
    fetchCases();
  }

  return (
    <main style={{ padding: 24, maxWidth: 880, margin: "0 auto" }}>
      <h1>Jikenda – 事案登録</h1>

      <p style={{ marginTop: 8 }}>
        <Link href="/">トップへ戻る</Link> / <Link href="/login">ログイン・新規登録</Link>
      </p>

      {!user ? (
        <p style={{ marginTop: 16 }}>
          まずは <Link href="/login">ログイン / 新規登録</Link> してください。
        </p>
      ) : (
        <>
          <p style={{ marginTop: 8 }}>
            ログイン中：<b>{user.email}</b>{" "}
            <LogoutButton />
          </p>

          <section style={{ marginTop: 24 }}>
            <h2>事案登録フォーム</h2>
            <div style={{ display: "grid", gap: 8, maxWidth: 640 }}>
              <label>
                カテゴリ：
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ marginLeft: 8 }}
                >
                  <option>労働</option>
                  <option>離婚</option>
                  <option>借金</option>
                  <option>交通事故</option>
                  <option>その他</option>
                </select>
              </label>

              <input
                placeholder="件名"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                rows={6}
                placeholder="相談内容"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={evidence}
                  onChange={(e) => setEvidence(e.target.checked)}
                />{" "}
                証拠あり
              </label>

              <button onClick={submitCase}>送信</button>
            </div>
          </section>

          <section style={{ marginTop: 24 }}>
            <h2>あなたの事案</h2>
            {rows.length === 0 ? (
              <p>まだ登録がありません。</p>
            ) : (
              <ul>
                {rows.map((r) => (
                  <li key={r.id} style={{ marginBottom: 12 }}>
                    <b>
                      [{r.category}] {r.title ?? "(無題)"}
                    </b>
                    <br />
                    <small>
                      {new Date(r.created_at).toLocaleString("ja-JP")}
                    </small>
                    <div style={{ whiteSpace: "pre-wrap" }}>{r.description}</div>
                    {r.evidence ? <div>🧾 証拠あり</div> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{msg}</pre>
    </main>
  );
}
