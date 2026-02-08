"use client";

import { useEffect, useMemo, useState } from "react";

type AppRow = {
  id: string;
  stageName: string;
  instagram?: string | null;
  setUrl?: string | null;
  mediaUrl?: string | null;
  email?: string | null;
  createdAt: string;
  published: boolean;
  publishedAt?: string | null;
  _count: { votes: number };
};

type Stats = {
  days: string[];
  publishedApps: { id: string; stageName: string }[];
  visitsByDay: Record<string, number>;
  votesByDay: Record<string, Record<string, number>>;
};

function shortUrl(u?: string | null) {
  if (!u) return "";
  try {
    const url = new URL(u);
    return `${url.hostname}${url.pathname}`.slice(0, 50) + (url.pathname.length > 50 ? "…" : "");
  } catch {
    return u.slice(0, 50) + (u.length > 50 ? "…" : "");
  }
}

export default function AdminPage() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const [a, s] = await Promise.all([
      fetch("/api/admin/applications").then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
    ]);
    setApps(a);
    setStats(s);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  const pending = useMemo(() => apps.filter((a) => !a.published), [apps]);
  const published = useMemo(() => apps.filter((a) => a.published), [apps]);

  async function setPublished(id: string, published: boolean) {
    await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published }),
    });
    refresh();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar sticky */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-semibold">Équinox</div>
            <nav className="text-sm text-white/70 flex gap-4">
              <a className="hover:text-white" href="/">Accueil</a>
              <a className="hover:text-white" href="/candidater">Candidater</a>
              <a className="hover:text-white" href="/vote">Vote</a>
              <a className="hover:text-white text-white" href="/admin">Admin</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15"
            >
              Rafraîchir
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-white text-black font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-semibold">Admin</h1>
        <p className="text-white/60 mt-2">
          {loading ? "Chargement…" : `${pending.length} en attente • ${published.length} publiées`}
        </p>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Visites (30j)">
            <div className="text-3xl font-semibold">
              {stats ? Object.values(stats.visitsByDay).reduce((a, b) => a + b, 0) : "—"}
            </div>
            <p className="text-white/50 text-sm mt-1">Total de pages vues trackées</p>
          </Card>

          <Card title="Votes (30j)">
            <div className="text-3xl font-semibold">
              {stats
                ? Object.values(stats.votesByDay).reduce(
                    (sum, day) => sum + Object.values(day).reduce((a, b) => a + b, 0),
                    0
                  )
                : "—"}
            </div>
            <p className="text-white/50 text-sm mt-1">Votes sur candidats publiés</p>
          </Card>

          <Card title="Top candidat (votes)">
            <div className="text-lg font-medium">
              {published
                .slice()
                .sort((a, b) => b._count.votes - a._count.votes)[0]?.stageName ?? "—"}
            </div>
            <p className="text-white/50 text-sm mt-1">
              {published.length
                ? `${published
                    .slice()
                    .sort((a, b) => b._count.votes - a._count.votes)[0]._count.votes} votes`
                : "Aucun publié"}
            </p>
          </Card>
        </section>

        {/* PENDING */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">En attente ({pending.length})</h2>
          {pending.length === 0 ? (
            <p className="text-white/50 mt-3">Aucune candidature en attente.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {pending.map((a) => (
                <AppCard key={a.id} a={a}>
                  <button
                    onClick={() => setPublished(a.id, true)}
                    className="px-4 py-2 rounded-xl bg-white text-black font-medium"
                  >
                    Publier
                  </button>
                </AppCard>
              ))}
            </div>
          )}
        </section>

        {/* PUBLISHED */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Publiées ({published.length})</h2>
          {published.length === 0 ? (
            <p className="text-white/50 mt-3">Aucune candidature publiée.</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {published.map((a) => (
                <AppCard key={a.id} a={a}>
                  <div className="text-white/70 text-sm mr-auto">
                    <span className="text-white/40">Votes :</span>{" "}
                    <span className="font-medium text-white">{a._count.votes}</span>
                  </div>
                  <button
                    onClick={() => setPublished(a.id, false)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15"
                  >
                    Dépublier
                  </button>
                </AppCard>
              ))}
            </div>
          )}
        </section>

        {/* SIMPLE “TIMELINE” (sans lib chart, juste lisible) */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Évolution (30 jours)</h2>
          {!stats ? (
            <p className="text-white/50 mt-3">Stats en chargement…</p>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card title="Visites / jour (top 10)">
                <ul className="text-sm text-white/80 space-y-2">
                  {stats.days
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((d) => (
                      <li key={d} className="flex justify-between">
                        <span className="text-white/60">{d}</span>
                        <span className="font-medium">{stats.visitsByDay[d] || 0}</span>
                      </li>
                    ))}
                </ul>
              </Card>

              <Card title="Votes / jour (top 10)">
                <ul className="text-sm text-white/80 space-y-2">
                  {stats.days
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((d) => {
                      const dayVotes = stats.votesByDay[d] || {};
                      const total = Object.values(dayVotes).reduce((a, b) => a + b, 0);
                      return (
                        <li key={d} className="flex justify-between">
                          <span className="text-white/60">{d}</span>
                          <span className="font-medium">{total}</span>
                        </li>
                      );
                    })}
                </ul>
              </Card>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <div className="text-white/70 text-sm">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function AppCard({ a, children }: { a: AppRow; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-4">
      <div>
        <div className="text-lg font-semibold">{a.stageName}</div>
        <div className="text-white/50 text-sm">
          {new Date(a.createdAt).toLocaleString()}
        </div>

        <div className="mt-3 text-sm text-white/70 space-y-1">
          <div className="truncate">
            <span className="text-white/40">IG :</span> {a.instagram || "—"}
          </div>

          <div className="truncate">
            <span className="text-white/40">Set :</span>{" "}
            {a.setUrl ? (
              <a className="underline hover:text-white" target="_blank" href={a.setUrl}>
                {shortUrl(a.setUrl)}
              </a>
            ) : (
              "—"
            )}
          </div>

          <div className="truncate">
            <span className="text-white/40">Media :</span>{" "}
            {a.mediaUrl ? (
              <a className="underline hover:text-white" target="_blank" href={a.mediaUrl}>
                {shortUrl(a.mediaUrl)}
              </a>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}
