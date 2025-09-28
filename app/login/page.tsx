// app/login/page.tsx
"use client";

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
      <h1>ログイン / 新規登録</h1>
      <form style={{ display: "grid", gap: 12 }}>
        <label>メール<input type="email" required style={{ width: "100%" }} /></label>
        <label>パスワード<input type="password" required style={{ width: "100%" }} /></label>
        <button type="submit">送信</button>
      </form>
      <p style={{ marginTop: 24 }}><a href="/">トップへ戻る</a></p>
    </main>
  );
}
