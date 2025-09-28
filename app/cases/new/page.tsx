"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "../../lib/supabaseClient";

type Step = 1 | 2 | 3 | 4;

const CASE_TYPES = [
  "貸したお金が返ってこない",
  "詐欺・消費者被害",
  "労働",
  "離婚",
  "借金",
  "交通事故",
  "その他",
] as const;

const PAYMENT_METHODS = ["振込", "現金", "その他"] as const;

export default function NewCasePage() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const [step, setStep] = useState<Step>(1);
  const [msg, setMsg] = useState("");

  const [caseType, setCaseType] =
    useState<(typeof CASE_TYPES)[number]>("貸したお金が返ってこない");

  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [claim, setClaim] = useState("（例）貸した○万円の返還を求めたい");

  const [hasContract, setHasContract] = useState<boolean | null>(null);
  const [paymentMethod, setPaymentMethod] =
    useState<(typeof PAYMENT_METHODS)[number]>("振込");
  const [hasReceipt, setHasReceipt] = useState<boolean | null>(null);
  const [hasChatlog, setHasChatlog] = useState<boolean | null>(null);

  const [similar, setSimilar] = useState<
    Array<{ id: number; title: string; body: string }>
  >([]);

  const next = () => setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  async function submit() {
    if (!supabase) return;
    setMsg("");

    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setMsg("ログインしてください。");
      return;
    }
    if (!summary.trim()) {
      setMsg("事件の概要（5W1H）を入力してください。");
      setStep(2);
      return;
    }

    const payload = {
      user_id: u.user.id,
      case_type: caseType,
      summary,
      title: title || null,
      description: description || null,
      claim: claim || null,
      has_contract: hasContract ?? null,
      payment_method: paymentMethod,
      has_receipt: hasReceipt ?? null,
      has_chatlog: hasChatlog ?? null,
      evidence: !!(hasContract || hasReceipt || hasChatlog),
    };

    const { error } = await supabase.from("cases").insert(payload);
    if (error) {
      setMsg(`保存エラー: ${error.message}`);
      return;
    }

    await fetchSimilar(summary);
    setMsg("保存しました。下に類似事例の候補を表示します。");
  }

  async function fetchSimilar(text: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from("precedents")
      .select("id,title,body")
      .ilike("body", `%${text.slice(0, 40)}%`)
      .limit(5);
    if (data) setSimilar(data as any);
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>事件の新規作成</h1>
      <p><Link href="/cases">← 事案一覧に戻る</Link></p>
      <p style={{ opacity: 0.7 }}>Step {step} / 4</p>

      {step === 1 && (
        <section>
          <h2>1. 事件タイプを選択</h2>
          <select value={caseType} onChange={(e) => setCaseType(e.target.value as any)}>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div style={{ marginTop: 16 }}><button onClick={next}>次へ</button></div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h2>2. 事件の概要（5W1H）</h2>
          <textarea
            rows={8}
            placeholder="いつ・どこで・誰が・何を・なぜ・どのように"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            style={{ width: "100%", marginTop: 8 }}
          />
          <details style={{ marginTop: 12 }}>
            <summary>補足（任意：件名・詳細メモ）</summary>
            <input
              placeholder="件名（任意）"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", marginTop: 8 }}
            />
            <textarea
              rows={5}
              placeholder="詳細メモ（任意）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", marginTop: 8 }}
            />
          </details>
          <div style={{ marginTop: 16 }}>
            <button onClick={back} style={{ marginRight: 8 }}>戻る</button>
            <button onClick={next}>次へ</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2>3. あなたの請求は？</h2>
          <textarea
            rows={4}
            placeholder="例）貸与した30万円の返還…"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            style={{ width: "100%" }}
          />
          <div style={{ marginTop: 16 }}>
            <button onClick={back} style={{ marginRight: 8 }}>戻る</button>
            <button onClick={next}>次へ</button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section>
          <h2>4. 証拠の有無</h2>

          <label style={{ display: "block", marginTop: 8 }}>
            契約書はありますか？
            <select value={String(hasContract)} onChange={(e) => setHasContract(e.target.value === "true")} style={{ marginLeft: 8 }}>
              <option value="true">ある</option><option value="false">ない</option>
            </select>
          </label>

          <label style={{ display: "block", marginTop: 8 }}>
            金銭のやり取りは？
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} style={{ marginLeft: 8 }}>
              {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>

          {paymentMethod === "現金" && (
            <label style={{ display: "block", marginTop: 8 }}>
              領収書はありますか？
              <select value={String(hasReceipt)} onChange={(e) => setHasReceipt(e.target.value === "true")} style={{ marginLeft: 8 }}>
                <option value="true">ある</option><option value="false">ない</option>
              </select>
            </label>
          )}

          <label style={{ display: "block", marginTop: 8 }}>
            相手とのやり取り（LINE等）はありますか？
            <select value={String(hasChatlog)} onChange={(e) => setHasChatlog(e.target.value === "true")} style={{ marginLeft: 8 }}>
              <option value="true">ある</option><option value="false">ない</option>
            </select>
          </label>

          <div style={{ marginTop: 16 }}>
            <button onClick={back} style={{ marginRight: 8 }}>戻る</button>
            <button onClick={submit}>保存して類似事例を見る</button>
          </div>
        </section>
      )}

      {msg && <p style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{msg}</p>}

      {similar.length > 0 && (
        <section style={{ marginTop: 24 }}>
          <h2>類似する判例・事例（簡易）</h2>
          <ul>
            {similar.map((s) => (
              <li key={s.id} style={{ marginBottom: 12 }}>
                <b>{s.title}</b>
                <div style={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>
                  {s.body.slice(0, 160)}…
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
