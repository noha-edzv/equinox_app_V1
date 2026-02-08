export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* HERO */}
      <section className="px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-equinox">
        ÉQUINOX
        </h1>

        <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
          Le festival étudiant qui met en lumière la scène émergente.
        </p>
      </section>

      {/* TREMPLIN */}
      <section className="px-6 py-20 bg-neutral-900 text-center">
        <h2 className="text-3xl font-semibold">
          Tremplin DJ
        </h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          Envoie ton set, fais voter ta communauté et joue sur la scène d’Equinox.
        </p>

        <a
          href="/candidater"
          className="inline-block mt-8 px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition"
        >
          Candidater
        </a>
      </section>

      {/* CLASSEMENT + ARTISTES */}
      <section className="px-6 py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        {/* TOP 5 */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Top 5 des votes</h3>

          <div className="space-y-4 text-gray-400">
            <div className="p-4 bg-neutral-900 rounded-lg">
              #1 — DJ Exemple
            </div>
            <div className="p-4 bg-neutral-900 rounded-lg">
              #2 — DJ Exemple
            </div>
            <div className="p-4 bg-neutral-900 rounded-lg">
              #3 — DJ Exemple
            </div>
          </div>
        </div>

        {/* ARTISTES RÉCENTS */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">
            Artistes récents
          </h3>

          <div className="space-y-4 text-gray-400">
            <div className="p-4 bg-neutral-900 rounded-lg">
              DJ Exemple — aujourd’hui
            </div>
            <div className="p-4 bg-neutral-900 rounded-lg">
              DJ Exemple — hier
            </div>
            <div className="p-4 bg-neutral-900 rounded-lg">
              DJ Exemple — la semaine dernière
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
