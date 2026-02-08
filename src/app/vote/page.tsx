export default function VotePage() {
  const fakeArtists = [
    { name: "DJ Nova", desc: "House / Groove — vibe solaire." },
    { name: "Karma", desc: "Techno mélodique — montée progressive." },
    { name: "Lynx", desc: "Hardgroove — énergie brute." },
  ];

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <a href="/" className="text-gray-400 hover:text-white">
          ← Retour
        </a>

        <div className="mt-6 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold">Voter</h1>
            <p className="mt-2 text-gray-400">
              Découvre les DJs validés et vote pour ton favori.
            </p>
          </div>

          <a
            href="/candidater"
            className="px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition"
          >
            Candidater
          </a>
        </div>

        <section className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fakeArtists.map((a) => (
            <div key={a.name} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
              <div className="h-40 rounded-xl bg-neutral-800 mb-4" />
              <h2 className="text-xl font-semibold">{a.name}</h2>
              <p className="mt-2 text-gray-400">{a.desc}</p>

              <div className="mt-4 rounded-xl bg-neutral-800 p-4 text-sm text-gray-300">
                Player SoundCloud (à brancher)
              </div>

              <button
                type="button"
                className="mt-5 w-full py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition"
              >
                Voter
              </button>

              <p className="mt-2 text-xs text-gray-500">
                (Le vote sera sécurisé à l’étape DB.)
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
