import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <h1>ようこそ Jikenda へ</h1>
      <p>これはトップページです。</p>

      <ul style={{ marginTop: 16, lineHeight: "2" }}>
        <li>
          <Link href="/cases">事案登録ページへ</Link>
        </li>
        <li>
          <Link href="/login">ログイン / 新規登録</Link>
        </li>
      </ul>
    </main>
  );
}
