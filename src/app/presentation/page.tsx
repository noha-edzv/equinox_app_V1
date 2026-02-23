import Link from "next/link";

export default function PresentationPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      {/* Top bar */}
      <header className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            Retour
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/candidater"
              className="rounded-full bg-neutral-500 text-black px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              Candidater
            </Link>
            <Link
              href="/vote"
              className="rounded-full border border-white/15 bg-white/0 text-white px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Voter
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-10">
        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white/80">
              Festival électro étudiant à Lille
            </p>

            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
              EQUINOX
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed max-w-2xl">
              Equinox est un festival étudiant dédié aux musiques électroniques, né à Lille
              avec une ambition simple : mettre en lumière les talents émergents et créer
              une expérience immersive, cohérente et fédératrice.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/candidater"
                className="rounded-2xl bg-neutral-500 text-black px-6 py-3 text-sm font-semibold hover:opacity-90"
              >
                Participer au tremplin
              </Link>
              <Link
                href="/vote"
                className="rounded-2xl border border-white/15 bg-white/0 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10"
              >
                Voter en ligne
              </Link>
              <a
                href="#tremplin"
                className="rounded-2xl border border-white/15 bg-white/0 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10"
              >
                Comprendre le format
              </a>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="text-sm font-semibold text-white">L’idée</div>
              <p className="mt-3 text-sm text-white/70 leading-relaxed">
                Faire grandir une scène étudiante et locale ambitieuse, avec une direction artistique forte
                et une vraie place donnée au public. Equinox, c’est la rencontre entre communauté, esthétique
                et musique électronique.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key figures */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Chiffres clés</h2>
              <p className="mt-2 text-sm text-white/70">
                Première édition : solide. Prochaine : encore plus structurée.
              </p>
            </div>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <StatCard value="400" label="festivaliers sur la première édition" />
            <StatCard value="3" label="soirées à guichets fermés" />
            <StatCard value="2" label="rendez-vous à venir avant le festival" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard
              title="À venir"
              desc="Un tremplin et une préchauffe du festival pour créer la montée en puissance et faire vivre la communauté avant le main event."
            />
            <InfoCard
              title="Ambition"
              desc="Construire un rendez-vous annuel incontournable. On ne promet pas, on le prouve. Et oui, on vise clairement le meilleur festival de Lille."
            />
          </div>
        </div>
      </section>

      {/* Tremplin */}
      <section id="tremplin" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Le Tremplin DJ</h2>
            <p className="mt-3 text-white/70 max-w-2xl leading-relaxed">
              Une sélection transparente, portée par le public, puis une vraie soirée tremplin pour départager en live.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/candidater"
              className="rounded-2xl bg-neutral-500 text-black px-5 py-2.5 text-sm font-semibold hover:opacity-90"
            >
              Candidater
            </Link>
            <Link
              href="/vote"
              className="rounded-2xl border border-white/15 bg-white/0 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Voter
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          <StepCard
            step="01"
            title="Candidature en ligne"
            desc="Tu déposes ton profil et ton set. L’équipe valide les candidatures avant publication."
          />
          <StepCard
            step="02"
            title="Vote en ligne"
            desc="Le public vote pour ses DJ préférés. La dynamique compte : mobilise ton entourage."
          />
          <StepCard
            step="03"
            title="Soirée Tremplin"
            desc="Les 5 à 7 artistes ayant le plus de voix sont invités à mixer lors d’une soirée dédiée."
          />
          <StepCard
            step="04"
            title="Vote en direct"
            desc="Pendant la soirée, le public vote en direct pour élire son DJ favori."
          />
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h3 className="text-lg font-semibold">Si tu es DJ</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                Le vote en ligne détermine qui joue lors de la soirée tremplin. Ton public fait partie de l’histoire.
                Si tu participes, viens avec du monde.
              </p>
            </div>
            <div className="md:col-span-4 flex md:justify-end">
              <Link
                href="/candidater"
                className="w-full md:w-auto rounded-2xl bg-neutral-500 text-black px-6 py-3 text-sm font-semibold hover:opacity-90 text-center"
              >
                Je candidate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners band */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Partenaires</h2>
              <p className="mt-2 text-sm text-white/70">
                Ils nous soutiennent et rendent l’aventure possible.
              </p>
            </div>
            <a
              href="mailto:contact@centralelillefestival.fr?subject=Partenariat%20%E2%80%94%20EQUINOX"
              className="rounded-2xl border border-white/15 bg-white/0 text-white px-5 py-2.5 text-sm font-semibold hover:bg-white/10"
            >
              Devenir partenaire
            </a>
          </div>

          {/* Placeholder chips: remplace par des logos si tu veux */}
          <div className="mt-8 flex flex-wrap gap-3">
            <PartnerChip name="Monster" />
            <PartnerChip name="Comin" />
            <PartnerChip name="Centrale Lille Institut" />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-sm text-white/70 leading-relaxed">
              Tu veux t’associer à Equinox ? On construit des activations propres, cohérentes et visibles,
              avec une audience étudiante engagée et une identité très forte.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Un projet étudiant structuré</h2>
              <p className="mt-4 text-white/70 leading-relaxed">
                Equinox est porté par une équipe étudiante organisée autour de pôles dédiés : direction artistique,
                programmation, partenariats, communication, logistique et production. L’ambition est de grandir
                à chaque édition et de professionnaliser le format.
              </p>
            </div>
            <div className="md:col-span-4 flex md:justify-end">
              <Link
                href="/"
                className="w-full md:w-auto rounded-2xl border border-white/15 bg-white/0 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 text-center"
              >
                Revenir à l’accueil
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-white/40">
          EQUINOX — Lille
        </div>
      </section>
    </main>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
      <div className="text-3xl md:text-4xl font-bold tracking-tight">{value}</div>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{label}</p>
    </div>
  );
}

function InfoCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <div className="text-xs font-semibold text-white/50">{step}</div>
      <div className="mt-2 text-base font-semibold">{title}</div>
      <p className="mt-2 text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  );
}

function PartnerChip({ name }: { name: string }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">
      {name}
    </div>
  );
}
