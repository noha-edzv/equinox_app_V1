"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ModalState =
  | { status: "idle" }
  | { status: "success"; title: string; message: string }
  | { status: "error"; title: string; message: string; details?: string };

export default function CandidaterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ✅ modal result
  const [modalOpen, setModalOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ status: "idle" });

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
    if (t.startsWith("http")) return t; // si l'utilisateur colle l'URL, on garde
    return t.replace(/^@/, "");
  }

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // ✅ validation live (pour bloquer le submit + message sous champ si tu veux)
  const validation = useMemo(() => {
    const errors: string[] = [];

    const stage = form.stageName.trim();
    const ig = normalizeInstagram(form.instagram);
    const set = form.setUrl.trim();

    if (!stage) errors.push("Nom d'artiste requis.");
    if (!ig) errors.push("Instagram est obligatoire.");
    if (!set) errors.push("Lien du set obligatoire (SoundCloud/Drive).");

    if (set && !isValidUrl(set)) errors.push("Le lien du set n’est pas une URL valide.");

    // (Optionnel mais conseillé) : limiter à soundcloud/drive
    if (set && isValidUrl(set)) {
      const lower = set.toLowerCase();
      const ok =
        lower.includes("soundcloud.com") ||
        lower.includes("on.soundcloud.com") ||
        lower.includes("drive.google.com") ||
        lower.includes("dropbox.com");
      if (!ok) errors.push("Le lien du set doit venir de SoundCloud ou Google Drive (ou équivalent).");
    }

    if (!form.under1h) errors.push("Tu dois valider l'utilisation de ton image pour le tremplin.");

    return { ok: errors.length === 0, errors };
  }, [form.stageName, form.instagram, form.setUrl, form.under1h]);

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

  function openErrorModal(message: string, details?: string) {
    setModalState({
      status: "error",
      title: "Candidature non envoyée ❌",
      message,
      details,
    });
    setModalOpen(true);
  }

  function openSuccessModal() {
    setModalState({
      status: "success",
      title: "Candidature envoyée ✅",
      message: "On a bien reçu ta candidature. Elle sera validée par l’équipe avant publication.",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);

    // ✅ si succès => home
    if (modalState.status === "success") {
      router.push("/");
      return;
    }

    // ✅ si erreur => on ne reset rien => l’utilisateur retrouve le form rempli
  }

  async function handleSubmit() {
    setMsg(null);

    // ✅ bloque direct
    if (!validation.ok) {
      openErrorModal(
        "Il manque des infos obligatoires ou un champ est invalide.",
        validation.errors.join("\n")
      );
      return;
    }
    // Avant setLoading(true) ou juste après validation.ok
  const validateRes = await fetch("/api/validate-links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instagram: form.instagram, setUrl: form.setUrl }),
  });

  const validateData = await validateRes.json().catch(() => ({}));

  if (!validateRes.ok) {
    openErrorModal(
      validateData?.message || "Liens invalides.",
      validateData?.field ? `Champ: ${validateData.field}` : validateData?.details ? JSON.stringify(validateData.details, null, 2) : undefined
    );
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
          instagram: normalizeInstagram(form.instagram), // ✅ obligatoire
          email: form.email,
          description: form.description,
          mediaUrl, // <- URL Cloudinary
          setUrl: form.setUrl, // ✅ obligatoire
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // on affiche une erreur claire + le détail si tu le renvoies côté API
        const main = data?.error || data?.message || "Erreur lors de l’envoi.";
        const details = data?.details || (data ? JSON.stringify(data, null, 2) : undefined);
        openErrorModal(main, details);
        return;
      }

      // ✅ succès : modal + (optionnel) reset
      openSuccessModal();

      // Tu peux reset ici, mais vu que tu rediriges au close modal, pas obligatoire.
      // Je le laisse (c’est propre si tu veux rester sur la page sans redirect).
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
      openErrorModal("Erreur réseau. Réessaie.", e?.message);
    } finally {
      setUploading(false);
      setLoading(false);
    }
  }

  const disableSubmit = loading || uploading || !validation.ok;

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

          <Field label="Nom d'artiste *" value={form.stageName} onChange={(v) => setField("stageName", v)} />

          <Field
            label="Instagram *"
            value={form.instagram}
            onChange={(v) => setField("instagram", v)}
            placeholder="@toncompte ou lien"
          />

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
                  setField("mediaUrl", "");
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
                <p className="mt-3 text-xs text-green-300 break-all">✅ Photo prête</p>
              ) : uploading ? (
                <p className="mt-3 text-xs text-gray-300">Upload en cours…</p>
              ) : (
                <p className="mt-3 text-xs text-gray-500">jpg/png/webp • max 8MB</p>
              )}
            </div>
          </div>

          <Field
            label="Lien du set (SoundCloud ou Drive) *"
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

          {!validation.ok ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70 whitespace-pre-wrap">
              <div className="font-semibold text-white mb-2">À corriger avant d’envoyer :</div>
              {validation.errors.map((e) => `• ${e}`).join("\n")}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={disableSubmit}
            className="w-full py-4 rounded-full bg-neutral-500 text-black font-medium hover:bg-gray-200 transition disabled:opacity-60"
          >
            {uploading ? "Upload photo…" : loading ? "Envoi..." : "Envoyer ma candidature"}
          </button>

          {msg ? <p className="text-sm text-gray-300">{msg}</p> : null}
        </form>
      </div>

      <ResultModal open={modalOpen} state={modalState} onClose={closeModal} />
    </main>
  );
}

function ResultModal({
  open,
  state,
  onClose,
}: {
  open: boolean;
  state: ModalState;
  onClose: () => void;
}) {
  if (!open) return null;

  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-neutral-950 border border-white/10 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {state.status !== "idle" ? state.title : "Info"}
            </h3>

            {state.status !== "idle" ? (
              <p className="mt-2 text-sm text-white/70 whitespace-pre-wrap">{state.message}</p>
            ) : null}

            {isError && state.details ? (
              <p className="mt-3 text-xs text-white/50 whitespace-pre-wrap">{state.details}</p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-white/80 hover:bg-white/10"
          >
            Fermer
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            OK
          </button>
        </div>

        {isSuccess ? (
          <p className="mt-3 text-xs text-white/50">Tu seras redirigé(e) vers l’accueil en fermant.</p>
        ) : null}
      </div>
    </div>
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
