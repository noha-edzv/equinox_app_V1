// src/app/page.tsx
import Link from "next/link";
import  prisma  from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AppRow = {
  id: string;
  stageName: string;
  instagram: string | null;
  setUrl: string | null;
  mediaUrl: string | null;
  createdAt: Date;
  published: boolean;
  _count: { votes: number };
};

function Card({ a, rank }: { a: AppRow; rank?: number }) {
  const insta = a.instagram?.replace("@", "");

  return (
    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-semibold text-white truncate">
            {rank ? `#${rank} — ` : ""}
            {a.stageName}
          </div>

          <div className="mt-1 text-sm text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
            {insta ? <span>@{insta}</span> : null}

            {a.setUrl ? (
              <a
                href={a.setUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                Set / liens
              </a>
            ) : null}

            {a.mediaUrl ? (
              <a
                href={a.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                Écouter
              </a>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-xs text-gray-400">Votes</div>
          <div className="text-xl font-semibold text-white">{a._count.votes}</div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  // TOP 5 (publiés) par votes
  const topByVotes = (await prisma.application.findMany({
    where: { published: true },
    orderBy: [{ votes: { _count: "desc" } }, { createdAt: "desc" }],
    take: 5,
    select: {
      id: true,
      stageName: true,
      instagram: true,
      setUrl: true,
      mediaUrl: true,
      createdAt: true,
      published: true,
      _count: { select: { votes: true } },
    },
  })) as unknown as AppRow[];

  // Récents (publiés) par date
  const recent = (await prisma.application.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      stageName: true,
      instagram: true,
      setUrl: true,
      mediaUrl: true,
      createdAt: true,
      published: true,
      _count: { select: { votes: true } },
    },
  })) as unknown as AppRow[];

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-equinox">
          EQUINOX
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          Le festival étudiant qui met en lumière la scène émergente de la MEL
        </p>

        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/vote"
            className="px-6 py-3 rounded-full bg-neutral-500 text-black font-medium hover:bg-gray-180 transition"
          >
            Voter
          </Link>

          <Link
            href="/candidater"
            className="px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 transition"
          >
            Candidater
          </Link>
        </div>
      </section>

      {/* TREMPLIN */}
      <section className="px-6 py-20 bg-neutral-900 text-center">
        <h2 className="text-3xl font-semibold">Tremplin DJ</h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          Envoie ton set, fais voter ta communauté et joue sur la scène d’Equinox.
        </p>

        <Link
          href="/candidater"
          className="inline-block mt-8 px-8 py-4 bg-neutral-500 text-black font-medium rounded-full hover:bg-gray-180 transition"
        >
          Candidater
        </Link>
      </section>

      {/* CLASSEMENTS */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
        
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* TOP VOTES */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Top 5 des votes</h4>
              <div className="space-y-3">
                {topByVotes.length === 0 ? (
                  <div className="text-gray-400">
                    Aucun candidat publié pour l’instant.
                  </div>
                ) : (
                  topByVotes.map((a, idx) => (
                    <Card key={a.id} a={a} rank={idx + 1} />
                  ))
                )}
              </div>
            </div>

            {/* RECENTS */}
            <div>
              <h4 className="text-xl font-semibold mb-4">Artistes récents</h4>
              <div className="space-y-3">
                {recent.length === 0 ? (
                  <div className="text-gray-400">
                    Aucun candidat publié pour l’instant.
                  </div>
                ) : (
                  recent.map((a) => <Card key={a.id} a={a} />)
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/vote"
              className="inline-block px-8 py-4 bg-neutral-500 text-black font-medium rounded-full hover:bg-gray-200 transition"
            >
              Voir tous les candidats & voter
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

