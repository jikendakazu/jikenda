"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../../lib/supabaseClient";

type CaseType =
  | "貸したお金が返ってこない"
  | "詐欺・消費者被害"
  | "労働"
  | "離婚"
  | "借金"
  | "交通事故"
  | "その他";

export default function NewCasePage() {
  const supabase = useMemo(() => getBrowserSupabase(), []);
  const router = useRouter();

  // 1. 事件タイプ
  const [caseType, setCaseType] = useState<CaseType>("貸したお金が返ってこない");
  // 2. 5W1H 要約
  const [summary, setSummary] = useState("");
  // 3. 請求内容
  const [claim, setClaim] = useState("");
  // 4. 証拠系
  const [hasContract, setHasContract] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"振込" | "現金" | "その他">("振込");
  const [hasReceipt, setHasReceipt] = useState(false);
  const [hasChatlog, setHasChatlog] = useState(false);

  // 既存カラム（任意）
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    // SSR 中などで supabase が null の可能性に対応
    if (!supabase) return;

    setMsg("");
    setLoading(true);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      setMsg("ログインしてください。");
      setLoading(false);
      return;
    }

    const payload = {
      user_id: user.id,

      // 新カラム
      case_type: caseType,
      summary: summary || null,
      claim: claim || null,
      has_contract: hasContract,
      payment_method: paymentMethod,
      has_receipt: hasReceipt,
      has_chatlog: hasChatlog,

      // 既存カラム（一覧と互換）
      title: title || null,
      description: description || null,
      evidence: hasContract || hasReceipt || hasChatlog, // ざっくり “証拠あり” 集約
    };

    const { error } = await supabase.from("cases").insert(payload);
    if (error) {
      setMsg(`登録エラー: ${error.message}`);
      setLoading(false);
      return;
    }

    setMsg("登録しました。一覧へ移動します…");
    // 少し待ってから一覧へ
    setTimeout(() => router.push("/cases"), 500);
  }

  return (
    <main style={{ padding: 24, maxWidth: 880, margin: "0 auto" }}>
      <h1>事件を新規作成</h1>

      <p style={{ marginTop: 8 }}>
        <a href="/cases">← 事件一覧へ戻る</a>
      </p>

      <section style={{ marginTop: 16 }}>
        <h2>1) 事件タイプ</h2>
        <select
          value={caseType}
          onChange={(e) => setCaseType(e.target.value as CaseType)}
        >
          {[
            "貸したお金が返ってこない",
            "詐欺・消費者被害",
            "労働",
            "離婚",
            "借金",
            "交通事故",
            "その他",
          ].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>2) 事件の概要（5W1H）</h2>
        <textarea
          rows={6}
          placeholder="いつ（When）、どこで（Where）、誰が（Who）、何を（What）、なぜ（Why）、どのように（How）"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          style={{ width: "100%" }}
        />
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>3) あなたの請求は？</h2>
        <textarea
          rows={3}
          placeholder="例）〇〇万円の返還を求めたい／契約解除を求めたい など"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          style={{ width: "100%" }}
        />
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>4) 証拠の有無</h2>
        <label style={{ display: "block", marginTop: 8 }}>
          <input
            type="checkbox"
            checked={hasContract}
            onChange={(e) => setHasContract(e.target.checked)}
          />{" "}
          契約書はある
        </label>

        <div style={{ marginTop: 8 }}>
          金銭のやり取り：
          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as "振込" | "現金" | "その他")
            }
            style={{ marginLeft: 8 }}
          >
            <option value="振込">振込</option>
            <option value="現金">現金</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <label style={{ display: "block", marginTop: 8 }}>
          <input
            type="checkbox"
            checked={hasReceipt}
            onChange={(e) => setHasReceipt(e.target.checked)}
          />{" "}
          現金の場合、領収書はある
        </label>

        <label style={{ display: "block", marginTop: 8 }}>
          <input
            type="checkbox"
            checked={hasChatlog}
            onChange={(e) => setHasChatlog(e.target.checked)}
          />{" "}
          相手とのやり取り（LINE等）はある
        </label>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>（任意）一覧向けのタイトル/詳細</h3>
        <input
          placeholder="件名（例：返済が遅延している）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%" }}
        />
        <textarea
          rows={4}
          placeholder="概要メモ（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", marginTop: 8 }}
        />
      </section>

      <div style={{ marginTop: 24 }}>
        <button onClick={onSubmit} disabled={loading}>
          {loading ? "送信中…" : "登録する"}
        </button>
        {msg && (
          <p style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
            {msg}
          </p>
        )}
      </div>
    </main>
  );
}
