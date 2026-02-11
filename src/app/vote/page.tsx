"use client";

import { useEffect, useMemo, useState } from "react";

type AppRow = {
  id: string;
  stageName: string;
  instagram?: string | null;
  setUrl?: string | null;
  mediaUrl?: string | null;
  email?: string | null;
  description?: string | null;
  _count?: { votes: number };
};

function isSoundcloud(url?: string | null) {
  if (!url) return false;
  return url.includes("soundcloud.com") || url.includes("snd.sc");
}

function soundcloudEmbedSrc(trackUrl: string) {
  const encoded = encodeURIComponent(trackUrl);
  return `https://w.soundcloud.com/player/?url=${encoded}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`;
}

export default function VotePage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);

      const res = await fetch("/api/applications", { cache: "no-store" });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`/api/applications -> ${res.status} ${txt}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : (data?.applications ?? []);
      setApps(list);

    } catch (e: any) {
      setErr(e?.message ?? "Impossible de charger les candidatures");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    const list = [...apps];
    list.sort((a, b) => (b._count?.votes ?? 0) - (a._count?.votes ?? 0));
    return list;
  }, [apps]);

  async function vote(applicationId: string) {
    try {
      setVotingId(applicationId);

      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Vote failed: ${res.status} ${txt}`);
      }

      // update local
      setApps((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, _count: { votes: (a._count?.votes ?? 0) + 1 } }
            : a
        )
      );
    } catch (e: any) {
      alert(e?.message ?? "Erreur vote");
    } finally {
      setVotingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vote</h1>
          <p className="text-neutral-400">Écoute les sets et vote.</p>
        </div>

        <button
          onClick={load}
          className="rounded-lg border border-neutral-800 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
        >
          Rafraîchir
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-300">Chargement…</p>
      ) : err ? (
        <p className="text-red-400">{err}</p>
      ) : sorted.length === 0 ? (
        <p className="text-neutral-300">Aucune candidature publiée pour l’instant.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {sorted.map((a) => (
            <div key={a.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold">{a.stageName}</div>
                  <div className="mt-1 text-sm text-neutral-400">
                    Votes : <span className="text-neutral-200">{a._count?.votes ?? 0}</span>
                  </div>
                  {a.instagram ? (
                    <div className="mt-1 text-sm text-neutral-400">@{a.instagram}</div>
                  ) : null}
                </div>

                <button
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
                  disabled={votingId === a.id}
                  onClick={() => vote(a.id)}
                >
                  {votingId === a.id ? "Vote…" : "Voter"}
                </button>
              </div>

              {a.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-200">{a.description}</p>
              ) : (
                <p className="mt-4 text-sm text-neutral-500 italic">Pas de description.</p>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {a.setUrl ? (
                  <a className="underline" href={a.setUrl} target="_blank" rel="noreferrer">
                    Lien set
                  </a>
                ) : null}

                {a.mediaUrl && !isSoundcloud(a.mediaUrl) ? (
                  <a className="underline" href={a.mediaUrl} target="_blank" rel="noreferrer">
                    Média
                  </a>
                ) : null}
              </div>

              {isSoundcloud(a.mediaUrl) ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800">
                  <iframe
                    title={`soundcloud-${a.id}`}
                    width="100%"
                    height="300"
                    allow="autoplay"
                    src={soundcloudEmbedSrc(a.mediaUrl!)}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}