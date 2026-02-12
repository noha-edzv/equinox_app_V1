"use client";

import { useEffect, useMemo, useState } from "react";

type Application = {
  id: string;
  stageName: string;
  instagram: string | null;
  setUrl: string | null;
  mediaUrl: string | null;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  description?: string | null;
  published: boolean;
  createdAt: string;
  _count?: { votes: number };
};

export default function AdminPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "pending">("all");
  const [query, setQuery] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<Application | null>(null);
  const [editForm, setEditForm] = useState({
   stageName: "",
   instagram: "",
    setUrl: "",
    mediaUrl: "",
    email: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

    function openEdit(a: Application) {
    setEditing(a);
    setEditForm({
      stageName: a.stageName ?? "",
      instagram: a.instagram ?? "",
      setUrl: a.setUrl ?? "",
      mediaUrl: a.mediaUrl ?? "",
      email: a.email ?? "",
      description: a.description ?? "",
    });
  }

  async function saveEdit() {
    if (!editing) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          id: editing.id,
          data: editForm,
        }),
      });

      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Erreur API (${res.status})`);
      }

      setEditing(null);
      await load();
    } catch (e: any) {
      alert(`Édit — erreur : ${String(e?.message ?? e)}`);
    } finally {
      setSaving(false);
    }
  }


  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const url =
        filter === "published"
          ? "/api/admin?published=true"
          : filter === "pending"
          ? "/api/admin?published=false"
          : "/api/admin";

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Erreur API (${res.status})`);
      }

      setApps(data.applications ?? []);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
      setApps([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function action(
    act: "publish" | "unpublish" | "delete",
    id: string
  ) {
    const label =
      act === "publish"
        ? "Publier"
        : act === "unpublish"
        ? "Retirer"
        : "Supprimer";
    const ok =
      act !== "delete"
        ? true
        : confirm("T’es sûre ? Ça supprime la candidature (et ses votes si besoin).");
    if (!ok) return;

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: act, id }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || `Erreur API (${res.status})`);
      }
      await load();
    } catch (e: any) {
      alert(`${label} — erreur : ${String(e?.message ?? e)}`);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) => {
      const hay = [
        a.stageName,
        a.instagram ?? "",
        a.email ?? "",
        a.setUrl ?? "",
        a.mediaUrl ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [apps, query]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Admin — candidatures
            </h1>
            <p className="text-white/60 mt-2">
              Gère les candidatures : publier / retirer / supprimer + votes.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex rounded-xl border border-white/15 overflow-hidden">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 text-sm ${
                  filter === "all" ? "bg-white text-black" : "bg-transparent"
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 text-sm ${
                  filter === "pending" ? "bg-white text-black" : "bg-transparent"
                }`}
              >
                À valider
              </button>
              <button
                onClick={() => setFilter("published")}
                className={`px-4 py-2 text-sm ${
                  filter === "published" ? "bg-white text-black" : "bg-transparent"
                }`}
              >
                Publiés
              </button>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, insta, email...)"
              className="w-full md:w-80 rounded-xl bg-white/5 border border-white/15 px-4 py-2 text-sm outline-none focus:border-white/30"
            />

            <button
              onClick={load}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="text-sm text-white/70">
              {loading ? "Chargement..." : `${filtered.length} candidature(s)`}
            </div>
            {err ? (
              <div className="text-sm text-red-300">
                Erreur : {err}
              </div>
            ) : null}
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/70">
                <tr>
                  <th className="text-left px-5 py-3">Nom</th>
                  <th className="text-left px-5 py-3">Votes</th>
                  <th className="text-left px-5 py-3">Statut</th>
                  <th className="text-left px-5 py-3">Liens</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-6 text-white/60" colSpan={5}>
                      Chargement des candidatures…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-white/60" colSpan={5}>
                      Rien à afficher.
                    </td>
                  </tr>
                ) : (
                  filtered.map((a) => (
                    <tr key={a.id} className="border-t border-white/10">
                      <td className="px-5 py-4">
                        <div className="font-semibold">{a.stageName}</div>
                          {(a.firstName || a.lastName) ? (
                         <div className="text-white/50 text-xs mt-1">
                             {a.firstName ?? ""} {a.lastName ?? ""}
                          </div>
                          ) : null}

                        <div className="text-white/50 text-xs mt-1">
                          {a.email ?? "—"} · {new Date(a.createdAt).toLocaleString()}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-white/10 px-2 py-1">
                          {a._count?.votes ?? 0}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {a.published ? (
                          <span className="rounded-lg bg-green-500/20 text-green-200 px-2 py-1">
                            Publié
                          </span>
                        ) : (
                          <span className="rounded-lg bg-yellow-500/20 text-yellow-200 px-2 py-1">
                            À valider
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-white/80">
                        <div className="flex flex-col gap-1">
                          {a.instagram ? (
                            <a
                              className="underline underline-offset-4 hover:text-white"
                              href={
                                a.instagram.startsWith("http")
                                  ? a.instagram
                                  : `https://instagram.com/${a.instagram.replace("@", "")}`
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              Instagram
                            </a>
                          ) : (
                            <span className="text-white/40">Insta —</span>
                          )}

                          {a.setUrl ? (
                            <a
                              className="underline underline-offset-4 hover:text-white"
                              href={a.setUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Set
                            </a>
                          ) : (
                            <span className="text-white/40">Set —</span>
                          )}

                          {a.mediaUrl ? (
                            <a
                              className="underline underline-offset-4 hover:text-white"
                              href={a.mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Media
                            </a>
                          ) : (
                            <span className="text-white/40">Media —</span>
                          )}

                          
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {a.published ? (
                            <button
                              onClick={() => action("unpublish", a.id)}
                              className="rounded-xl border border-white/15 px-3 py-2 text-xs hover:bg-white/10"
                            >
                              Retirer
                            </button>
                          ) : (
                            <button
                              onClick={() => action("publish", a.id)}
                              className="rounded-xl bg-white text-black px-3 py-2 text-xs hover:opacity-90"
                            >
                              Publier
                            </button>
                          )}
                            <button
                              onClick={() => openEdit(a)}
                              className="rounded-xl border border-white/15 px-3 py-2 text-xs hover:bg-white/10"
                            >
                              Éditer
                            </button>


                          <button
                            onClick={() => action("delete", a.id)}
                            className="rounded-xl border border-red-400/30 text-red-200 px-3 py-2 text-xs hover:bg-red-500/10"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/50">
          Astuce : “À valider” = published=false (invisible côté Vote).
        </p>
      </div>
    </main>
  );
}
