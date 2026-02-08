"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setErr("Mauvais mot de passe");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white/5 border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-white/60 mt-1">Connexion</p>

        <input
          type="password"
          className="mt-5 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <p className="text-red-400 text-sm mt-3">{err}</p>}

        <button className="mt-5 w-full rounded-xl bg-white text-black py-3 font-medium">
          Se connecter
        </button>
      </form>
    </main>
  );
}
