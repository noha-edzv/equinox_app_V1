"use client";

import { useEffect, useMemo, useState } from "react";

type AppRow = {
  id: string;
  stageName: string;
  instagram?: string | null;
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

function prettyInsta(handle?: string | null) {
  if (!handle) return null;
  const h = handle.trim().replace(/^@/, "");
  return h.length ? `@${h}` : null;
}

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
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
  const [open, setOpen] = useState(false);
  useLockBodyScroll(open);

  const insta = useMemo(() => prettyInsta(app.instagram), [app.instagram]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* CARD */}
      <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950">
        {/* Background image */}
        {app.mediaUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-200 group-hover:opacity-40 transition"
            style={{ backgroundImage: `url(${app.mediaUrl})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        )}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-2xl font-semibold tracking-tight">{app.stageName}</h3>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                <span>
                  Votes : <span className="text-white">{app._count?.votes ?? 0}</span>
                </span>
                {insta ? (
                  <a
                    className="truncate underline underline-offset-4 hover:text-white"
                    href={`https://instagram.com/${insta.replace("@", "")}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {insta}
                  </a>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="rounded-xl bg-black/10 px-4 py-2 text-sm hover:bg-white/15"
              >
                Plus
              </button>

              {showVote ? (
                <button
                  disabled={!onVote || voting}
                  onClick={() => onVote?.(app.id)}
                  className="rounded-xl bg-neutral-500 px-4 py-2 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {voting ? "Vote…" : "Voter"}
                </button>
              ) : null}
            </div>
          </div>

          {/* SoundCloud embed (compact) */}
          {isSoundcloud(app.setUrl) ? (
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <iframe
                title={`soundcloud-${app.id}`}
                width="100%"
                height="135"
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

      {/* MODAL */}
      {open ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-neutral-950">
              {app.mediaUrl ? (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-35"
                  style={{ backgroundImage: `url(${app.mediaUrl})` }}
                />
              ) : null}
              <div className="absolute inset-0 bg-black/65" />

              <div className="relative p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-3xl font-semibold tracking-tight text-white">{app.stageName}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/70">
                      <span>
                        Votes : <span className="text-white">{app._count?.votes ?? 0}</span>
                      </span>
                      {insta ? (
                        <a
                          className="underline underline-offset-4 hover:text-white"
                          href={`https://instagram.com/${insta.replace("@", "")}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {insta}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
                  >
                    Fermer
                  </button>
                </div>

                <div className="mt-5">
                  {app.description ? (
                    <p className="whitespace-pre-wrap text-sm text-white/85">{app.description}</p>
                  ) : (
                    <p className="text-sm text-white/50 italic">Pas de description.</p>
                  )}
                </div>

                {isSoundcloud(app.setUrl) ? (
                  <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                    <iframe
                      title={`soundcloud-modal-${app.id}`}
                      width="100%"
                      height="320"
                      allow="autoplay"
                      src={soundcloudEmbedSrc(app.setUrl!)}
                    />
                  </div>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  {app.setUrl ? (
                    <a
                      className="underline underline-offset-4 text-white/90 hover:text-white"
                      href={app.setUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Lien du set
                    </a>
                  ) : null}
                  {app.mediaUrl ? (
                    <a
                      className="underline underline-offset-4 text-white/90 hover:text-white"
                      href={app.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ouvrir l’image
                    </a>
                  ) : null}
                </div>

                {showVote ? (
                  <div className="mt-6">
                    <button
                      disabled={!onVote || voting}
                      onClick={() => onVote?.(app.id)}
                      className="w-full rounded-2xl bg-white py-3 text-sm font-medium text-black hover:bg-white/90 disabled:opacity-50"
                    >
                      {voting ? "Vote…" : "Voter"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
