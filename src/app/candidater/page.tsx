"use client";

import { useState } from "react";

export default function CandidaterPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    stageName: "",
    instagram: "",
    email: "",
    description: "",
    mediaUrl: "", // <- URL Cloudinary ici
    setUrl: "",
    under1h: false,
  });

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function normalizeInstagram(v: string) {
    const t = v.trim();
    if (!t) return "";
    return t.replace(/^@/, "");
  }

  async function uploadToCloudinary(file: File) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary non configuré (variables NEXT_PUBLIC_* manquantes).");
    }

    // validations simples côté front
    const maxMb = 8;
    if (!file.type.startsWith("image/")) {
      throw new Error("Le fichier doit être une image (jpg/png/webp).");
    }
    if (file.size > maxMb * 1024 * 1024) {
      throw new Error(`Image trop lourde (max ${maxMb}MB).`);
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);
    // si ton preset a déjà folder=equninox c’est ok, sinon on force :
    fd.append("folder", "equinox");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = data?.error?.message || "Erreur upload Cloudinary.";
      throw new Error(err);
    }

    return data?.secure_url as string;
  }

  async function handleSubmit() {
    setMsg(null);

    if (!form.stageName.trim()) {
      setMsg("Nom d'artiste requis.");
      return;
    }

    if (!form.under1h) {
      setMsg("Tu dois confirmer que ton set fait moins d’1h.");
      return;
    }

    setLoading(true);

    try {
      // 1) Upload photo si on en a une + si on n'a pas déjà une URL
      let mediaUrl = form.mediaUrl;

      if (photoFile && !mediaUrl) {
        setUploading(true);
        mediaUrl = await uploadToCloudinary(photoFile);
        setField("mediaUrl", mediaUrl);
      }

      // 2) Envoi candidature en DB
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          stageName: form.stageName,
          instagram: normalizeInstagram(form.instagram),
          email: form.email,
          description: form.description,
          mediaUrl, // <- URL Cloudinary
          setUrl: form.setUrl,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.details ? `${data.error} — ${data.details}` : (data?.error || "Erreur lors de l’envoi."));
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
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (e: any) {
      setMsg(e?.message || "Erreur réseau. Réessaie.");
    } finally {
      setUploading(false);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-gray-400 hover:text-white">
          ← Retour
        </a>

        <h1 className="mt-6 text-4xl font-bold">Candidater au tremplin</h1>
        <p className="mt-3 text-gray-400">
          Ton set doit durer moins d’1h. Une fois ta candidature remplie, elle sera soumise à validation de l’association avant d’être publiée.
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

          {/* ✅ Photo upload Cloudinary */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Photo (recommandé)</label>

            <div className="rounded-lg bg-neutral-950 border border-neutral-800 p-4">
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-gray-200"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setPhotoFile(f);
                  setField("mediaUrl", ""); // reset url si l'utilisateur change l'image
                  if (f) setPhotoPreview(URL.createObjectURL(f));
                  else setPhotoPreview(null);
                }}
              />

              {photoPreview ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800">
                  <img src={photoPreview} alt="Aperçu" className="w-full max-h-[320px] object-cover" />
                </div>
              ) : null}

              {form.mediaUrl ? (
                <p className="mt-3 text-xs text-green-300 break-all">
                  ✅ Photo prête
                </p>
              ) : uploading ? (
                <p className="mt-3 text-xs text-gray-300">Upload en cours…</p>
              ) : (
                <p className="mt-3 text-xs text-gray-500">jpg/png/webp • max 8MB</p>
              )}
            </div>
          </div>

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
            <span className="text-sm text-gray-300">J'autorise Equinox à utiliser mon image dans le cadre du tremplin.</span>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 rounded-full bg-neutral-500 text-black font-medium hover:bg-gray-200 transition disabled:opacity-60"
          >
            {uploading ? "Upload photo…" : loading ? "Envoi..." : "Envoyer ma candidature"}
          </button>

          {msg ? <p className="text-sm text-gray-300">{msg}</p> : null}
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
