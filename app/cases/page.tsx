"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "../lib/supabaseClient";
// LogoutButton を使う場合は↓の import を残してください（使わないなら削除してOK）
// import LogoutButton from "../components/LogoutButton";

type CaseRow = {
  id: string;
  user_id: string;
  // 既存
  category: string | null;
  title: string | null;
  description: string | null;
  evidence: boolean | null;
  created_at: string;
  // 追加（ヒアリング）
  case_type?: string | null;
  summary?: string | null;
  claim?: string | null;
  has_contract?: boolean | null;
  payment_method?: "振込" | "現金" | "その他" | null;
  has_receipt?: boolean | null;
  has_chatlog?: boolean | null;
};

export default function CasesPage() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [user, setUser] = useState<any>(null);
  const [msg, setMsg] = useState("");

  // 簡易フォーム（従来）
  const [category, setCategory] = useState("労働");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState(false);

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

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMsg("ログアウトしました");
    setRows([]);
    setUser(null);
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
            <button onClick={signOut} style={{ marginLeft: 8 }}>
              ログアウト
            </button>
          </p>

          <section style={{ marginTop: 24 }}>
            <h2>事案登録フォーム</h2>
            {/* ← ここが今回の追加  */}
            <p style={{margin:"8px 0 16px"}}>
              <Link href="/cases/new">+ ヒアリング形式で新規作成</Link>
            </p>

            {/* 既存の簡易フォームは残しておきます（お好みで非表示にしてOK） */}
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
                  <li key={r.id} style={{ marginBottom: 16, lineHeight: 1.6 }}>
                    <b>
                      [
                      {r.case_type
                        ? r.case_type
                        : r.category ?? "（分類なし）"}
                      ] {r.title ?? "(無題)"}
                    </b>
                    <br />
                    <small>
                      {new Date(r.created_at).toLocaleString("ja-JP")}
                    </small>

                    {/* ヒアリングで入れた要約や請求があれば表示 */}
                    {r.summary ? (
                      <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                        <u>概要</u>：{r.summary}
                      </div>
                    ) : null}
                    {r.claim ? (
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        <u>請求</u>：{r.claim}
                      </div>
                    ) : null}

                    {/* 証拠のミニタグ */}
                    <div style={{ marginTop: 4, fontSize: 13, opacity: 0.85 }}>
                      {r.evidence ? "🧾 証拠あり" : "（証拠未整理）"}
                      {r.has_contract ? "・契約書あり" : ""}
                      {r.payment_method ? `・やり取り: ${r.payment_method}` : ""}
                      {r.has_receipt ? "・領収書あり" : ""}
                      {r.has_chatlog ? "・チャットログあり" : ""}
                    </div>

                    {/* 旧 description も残す */}
                    {r.description ? (
                      <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>
                        {r.description}
                      </div>
                    ) : null}
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
