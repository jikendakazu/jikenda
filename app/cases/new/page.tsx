"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "../../lib/supabaseClient"; // ← /cases/new から見て ../../lib

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

  // 共通入力
  const [caseType, setCaseType] = useState<(typeof CASE_TYPES)[number]>("貸したお金が返ってこない");

  // 5W1Hの要約 & 詳細（任意）
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");          // 任意：短い件名
  const [description, setDescription] = useState(""); // 任意：経緯メモ

  // 請求
  const [claim, setClaim] = useState("（例）貸した○万円の返還を求めたい");

  // 証拠
  const [hasContract, setHasContract] = useState<boolean | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>("振込");
  const [hasReceipt, setHasReceipt] = useState<boolean | null>(null);
  const [hasChatlog, setHasChatlog] = useState<boolean | null>(null);

  // 類似判例
  const [similar, setSimilar] = useState<Array<{ id:number; title:string; body:string }>>([]);

  const next = () => setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  async function submit() {
    if (!supabase) return;
    setMsg("");

    // 認証
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setMsg("ログインしてください。");
      return;
    }

    // バリデーション最低限
    if (!summary.trim()) {
      setMsg("事件の概要（5W1H）を入力してください。");
      setStep(2);
      return;
    }

    // INSERT
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
      evidence: !!(hasContract || hasReceipt || hasChatlog), // 既存colを雑に利用
    };

    const { data, error } = await supabase.from("cases").insert(payload).select("id").single();
    if (error) {
      setMsg(`保存エラー: ${error.message}`);
      return;
    }

    // 類似検索（最初は「summary」で簡易全文検索）
    await fetchSimilar(summary);

    setMsg("保存しました。下に類似事例の候補を表示します。");
    // そのままこの画面に類似事例を出す/ または /cases へ遷移でもOK
  }

  async function fetchSimilar(text: string) {
    if (!supabase) return;
    // シンプル: body ILIKE で包含検索（まずは十分）
    const { data, error } = await supabase
      .from("precedents")
      .select("id,title,body")
      .ilike("body", `%${text.slice(0, 40)}%`) // 概要の先頭40文字をキーにする簡易検索
      .limit(5);

    if (!error && data) setSimilar(data as any);
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>事件の新規作成</h1>
      <p>
        <Link href="/cases">← 事案一覧に戻る</Link>
      </p>

      {/* ステップインジケータ */}
      <p style={{ opacity: 0.7 }}>Step {step} / 4</p>

      {/* STEP 1: 事件タイプ */}
      {step === 1 && (
        <section>
          <h2>1. 事件タイプを選択</h2>
          <select value={caseType} onChange={(e) => setCaseType(e.target.value as any)}>
            {CASE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div style={{ marginTop: 16 }}>
            <button onClick={next}>次へ</button>
          </div>
        </section>
      )}

      {/* STEP 2: 5W1H */}
      {step === 2 && (
        <section>
          <h2>2. 事件の概要（5W1H）</h2>
          <p style={{ fontSize: 14, opacity: 0.8, marginTop: 4 }}>
            いつ（When）・どこで（Where）・誰が（Who）・何を（What）・なぜ（Why）・どのように（How）を簡潔に
          </p>
          <textarea
            rows={8}
            placeholder={`例）2024年5月頃、知人Aに30万円を貸した。返済期日は7/末で合意。返済は未了。LINEに貸付の合意と期日が残っている。`}
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

      {/* STEP 3: 請求 */}
      {step === 3 && (
        <section>
          <h2>3. あなたの請求は？</h2>
          <textarea
            rows={4}
            placeholder="例）貸与した30万円の返還と年5%の遅延損害金を請求したい。"
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

      {/* STEP 4: 証拠 */}
      {step === 4 && (
        <section>
          <h2>4. 証拠の有無</h2>

          <label style={{ display: "block", marginTop: 8 }}>
            契約書はありますか？
            <select
              value={String(hasContract)}
              onChange={(e) => setHasContract(e.target.value === "true")}
              style={{ marginLeft: 8 }}
            >
              <option value="true">ある</option>
              <option value="false">ない</option>
            </select>
          </label>

          <label style={{ display: "block", marginTop: 8 }}>
            金銭のやり取りは？
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              style={{ marginLeft: 8 }}
            >
              {PAYMENT_METHODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>

          {paymentMethod === "現金" && (
            <label style={{ display: "block", marginTop: 8 }}>
              領収書はありますか？
              <select
                value={String(hasReceipt)}
                onChange={(e) => setHasReceipt(e.target.value === "true")}
                style={{ marginLeft: 8 }}
              >
                <option value="true">ある</option>
                <option value="false">ない</option>
              </select>
            </label>
          )}

          <label style={{ display: "block", marginTop: 8 }}>
            相手とのやり取り（LINE等）はありますか？
            <select
              value={String(hasChatlog)}
              onChange={(e) => setHasChatlog(e.target.value === "true")}
              style={{ marginLeft: 8 }}
            >
              <option value="true">ある</option>
              <option value="false">ない</option>
            </select>
          </label>

          <div style={{ marginTop: 16 }}>
            <button onClick={back} style={{ marginRight: 8 }}>戻る</button>
            <button onClick={submit}>保存して類似事例を見る</button>
          </div>
        </section>
      )}

      {msg && <p style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{msg}</p>}

      {/* 類似事例の結果 */}
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
