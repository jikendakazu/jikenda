"use client";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const signup = async () => {
    setMsg("");
    const { error } = await supabase.auth.signUp({ email, password });
    setMsg(error ? `SignUp error: ${error.message}` : "確認メールを送信しました。");
  };

  const signin = async () => {
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMsg(error ? `SignIn error: ${error.message}` : "ログイン成功");
  };

  return (
    <main>
      <h1>ログイン / 新規登録</h1>
      <div style={{display:"grid",gap:8,maxWidth:420}}>
        <input type="email" placeholder="メールアドレス" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" placeholder="パスワード" value={password} onChange={e=>setPassword(e.target.value)} />
        <div style={{display:"flex",gap:8}}>
          <button onClick={signup}>新規登録</button>
          <button onClick={signin}>ログイン</button>
        </div>
        <p>{msg}</p>
      </div>
    </main>
  );
}
