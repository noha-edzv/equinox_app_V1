"use client";

import { useEffect, useMemo, useState } from "react";
import ArtistCard from "@/components/ArtistCard";

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

export default function VotePage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoading(true);

      const res = await fetch("/api/applications", {
        cache: "no-store",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`/api/applications -> ${res.status} ${txt}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.applications ?? [];

      setApps(list);
    } catch (e: any) {
      setError(e?.message ?? "Impossible de charger les candidatures.");
      setApps([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...apps].sort(
      (a, b) => (b._count?.votes ?? 0) - (a._count?.votes ?? 0)
    );
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

      // update local vote count
      setApps((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, _count: { votes: (a._count?.votes ?? 0) + 1 } }
            : a
        )
      );
    } catch (e: any) {
      alert(e?.message ?? "Erreur lors du vote.");
    } finally {
      setVotingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Vote</h1>
          <p className="mt-2 text-neutral-400">
            Écoute les sets et vote pour ton artiste préféré.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
        >
          Rafraîchir
        </button>
      </div>

      {/* States */}
      {loading ? (
        <p className="text-neutral-400">Chargement…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : sorted.length === 0 ? (
        <p className="text-neutral-400">
          Aucune candidature publiée pour l’instant.
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {sorted.map((app) => (
            <ArtistCard
              key={app.id}
              app={app}
              showVote
              voting={votingId === app.id}
              onVote={(id) => vote(id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
