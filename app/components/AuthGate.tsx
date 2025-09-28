"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "../lib/supabaseClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = getBrowserSupabase();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!data.user) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, supabase]);

  if (!ready) return null; // ここでローディング入れてもOK
  return <>{children}</>;
}
