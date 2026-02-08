"use client";

import { useState } from "react";

export default function CandidaterPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    stageName: "",
    instagram: "",
    email: "",
    description: "",
    mediaUrl: "",
    setUrl: "",
    under1h: false,
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit() {
    setMsg(null);

    if (!form.under1h) {
      setMsg("Tu dois confirmer que ton set fait moins d’1h.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          stageName: form.stageName,
          instagram: form.instagram,
          email: form.email,
          description: form.description,
          mediaUrl: form.mediaUrl, // pour l’instant lien
          setUrl: form.setUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.error || "Erreur lors de l’envoi.");
        return;
      }

      setMsg("✅ Candidature envoyée ! Elle sera validée par l’équipe.");
      setForm({
        firstName: "",
        lastName: "",
        stageName: "",
        instagram: "",
        email: "",
        description: "",
        mediaUrl: "",
        setUrl: "",
        under1h: false,
      });
    } catch (e) {
      setMsg("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-gray-400 hover:text-white">
          ← Retour
        </a>

        <h1 className="mt-6 text-4xl font-bold">Candidater au tremplin</h1>
        <p className="mt-3 text-gray-400">
          Ton set doit durer moins d’1h. Ta candidature apparaîtra en admin pour validation.
        </p>

        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Prénom" value={form.firstName} onChange={(v) => setField("firstName", v)} />
            <Field label="Nom" value={form.lastName} onChange={(v) => setField("lastName", v)} />
          </div>

          <Field label="Nom d'artiste" value={form.stageName} onChange={(v) => setField("stageName", v)} />
          <Field label="Instagram" value={form.instagram} onChange={(v) => setField("instagram", v)} placeholder="@toncompte" />
          <Field label="Email" type="email" value={form.email} onChange={(v) => setField("email", v)} />

          <div>
            <label className="block text-sm text-gray-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 outline-none focus:border-white min-h-[120px]"
              placeholder="Ton style, tes influences, ton expérience…"
            />
          </div>

          <Field
            label="Lien photo/vidéo (temporaire)"
            value={form.mediaUrl}
            onChange={(v) => setField("mediaUrl", v)}
            placeholder="https://..."
          />

          <Field
            label="Lien du set (SoundCloud ou Drive)"
            value={form.setUrl}
            onChange={(v) => setField("setUrl", v)}
            placeholder="https://soundcloud.com/..."
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.under1h}
              onChange={(e) => setField("under1h", e.target.checked)}
            />
            <span className="text-sm text-gray-300">
              Je confirme que mon set dure moins d’1h
            </span>
          </div>

          <button
            disabled={loading}
            className="w-full py-4 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition disabled:opacity-60"
          >
            {loading ? "Envoi..." : "Envoyer ma candidature"}
          </button>

          {msg && <p className="text-sm text-gray-300">{msg}</p>}
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 outline-none focus:border-white"
      />
    </div>
  );
}
