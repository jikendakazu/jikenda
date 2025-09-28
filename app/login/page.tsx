// 省略: use client, import, useMemo などはそのまま

async function handleSubmit() {
  if (!supabase) return;
  setMsg("");

  try {
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMsg("ログイン成功！");
      router.push("/");     // ログイン後トップへ
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setMsg("登録メールを送信しました。受信トレイを確認してください。");
    }
  } catch (e: any) {
    setMsg(e.message ?? "エラーが発生しました");
  }
}
