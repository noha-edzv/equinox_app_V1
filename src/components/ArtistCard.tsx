"use client";

type AppRow = {
  id: string;
  stageName: string;
  description?: string | null;
  mediaUrl?: string | null;
  setUrl?: string | null;
  _count?: { votes: number };
};

function isSoundcloud(url?: string | null) {
  if (!url) return false;
  return url.includes("soundcloud.com") || url.includes("snd.sc");
}

function soundcloudEmbedSrc(trackUrl: string) {
  const encoded = encodeURIComponent(trackUrl);
  return `https://w.soundcloud.com/player/?url=${encoded}&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&visual=true`;
}

export default function ArtistCard({
  app,
  showVote,
  onVote,
  voting,
}: {
  app: AppRow;
  showVote?: boolean;
  onVote?: (id: string) => void;
  voting?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950">
      {/* Background image */}
      {app.mediaUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition"
          style={{ backgroundImage: `url(${app.mediaUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      )}

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{app.stageName}</h3>
            <p className="mt-1 text-sm text-white/70">
              Votes : <span className="text-white">{app._count?.votes ?? 0}</span>
            </p>
          </div>

          {showVote ? (
            <button
              disabled={!onVote || voting}
              onClick={() => onVote?.(app.id)}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
            >
              {voting ? "Vote…" : "Voter"}
            </button>
          ) : null}
        </div>

        {/* Description */}
        <div className="mt-4">
          {app.description ? (
            <p className="text-sm text-white/85 whitespace-pre-wrap">{app.description}</p>
          ) : (
            <p className="text-sm text-white/50 italic">Pas de description.</p>
          )}
        </div>

        {/* SoundCloud embed */}
        {isSoundcloud(app.setUrl) ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <iframe
              title={`soundcloud-${app.id}`}
              width="100%"
              height="320"
              allow="autoplay"
              src={soundcloudEmbedSrc(app.setUrl!)}
            />
          </div>
        ) : app.setUrl ? (
          <div className="mt-5">
            <a
              className="underline underline-offset-4 text-white/90 hover:text-white"
              href={app.setUrl}
              target="_blank"
              rel="noreferrer"
            >
              Écouter le set
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
