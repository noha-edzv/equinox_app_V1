import { NextResponse } from "next/server";

function normalizeInstagram(v: string) {
  const t = (v ?? "").toString().trim();
  if (!t) return "";
  if (t.startsWith("http")) return t;
  return t.replace(/^@/, "");
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isAllowedSetHost(u: URL) {
  const h = u.hostname.toLowerCase();
  return (
    h === "soundcloud.com" ||
    h.endsWith(".soundcloud.com") ||
    h === "on.soundcloud.com" ||
    h === "drive.google.com" ||
    h === "dropbox.com" ||
    h.endsWith(".dropbox.com")
  );
}

function instagramLooksValid(input: string) {
  const ig = normalizeInstagram(input);
  if (!ig) return { ok: false, reason: "Instagram manquant." };

  // si URL instagram
  if (ig.startsWith("http")) {
    if (!isValidUrl(ig)) return { ok: false, reason: "URL Instagram invalide." };
    const u = new URL(ig);
    const hostOk = u.hostname.toLowerCase().includes("instagram.com");
    const hasPath = u.pathname && u.pathname !== "/" && u.pathname.length > 2;
    if (!hostOk) return { ok: false, reason: "Le lien Instagram doit être sur instagram.com." };
    if (!hasPath) return { ok: false, reason: "Le lien Instagram ne pointe pas vers un profil." };
    return { ok: true };
  }

  // sinon pseudo
  const username = ig;
  const ok = /^[a-zA-Z0-9._]{1,30}$/.test(username);
  if (!ok) return { ok: false, reason: "Pseudo Instagram invalide (caractères autorisés: lettres/chiffres/._)" };
  return { ok: true };
}

async function checkUrlReachable(url: string) {
  // On tente HEAD d'abord, puis GET si HEAD bloqué
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "EquinoxValidator/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "EquinoxValidator/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
    }

    // on accepte 200-399
    const ok = res.status >= 200 && res.status < 400;
    return { ok, status: res.status };
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.name === "AbortError" ? "timeout" : (e?.message || "fetch_error") };
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: Request) {
  try {
    const { instagram, setUrl } = await req.json();

    // 1) Instagram check (format)
    const igCheck = instagramLooksValid(instagram);
    if (!igCheck.ok) {
      return NextResponse.json(
        { ok: false, field: "instagram", message: igCheck.reason },
        { status: 400 }
      );
    }

    // 2) SetUrl check (format + host)
    const set = (setUrl ?? "").toString().trim();
    if (!set) {
      return NextResponse.json(
        { ok: false, field: "setUrl", message: "Lien du set manquant." },
        { status: 400 }
      );
    }
    if (!isValidUrl(set)) {
      return NextResponse.json(
        { ok: false, field: "setUrl", message: "Lien du set invalide (URL)." },
        { status: 400 }
      );
    }
    const u = new URL(set);
    if (!isAllowedSetHost(u)) {
      return NextResponse.json(
        { ok: false, field: "setUrl", message: "Le lien du set doit venir de SoundCloud ou Google Drive (ou équivalent)." },
        { status: 400 }
      );
    }

    // 3) Reachability check (réel)
    const setReach = await checkUrlReachable(set);
    if (!setReach.ok) {
      return NextResponse.json(
        {
          ok: false,
          field: "setUrl",
          message: "Le lien du set ne répond pas correctement (lien cassé, privé ou inaccessible).",
          details: { status: setReach.status, error: setReach.error },
        },
        { status: 400 }
      );
    }

    // Instagram “réel” : souvent 403 même si ça existe (anti-bot), donc on évite de le fetch.
    // On s'arrête à la validation de format pour Instagram, c'est le plus robuste.

    return NextResponse.json({ ok: true, setStatus: setReach.status }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: "Erreur serveur validation.", details: e?.message },
      { status: 500 }
    );
  }
}
