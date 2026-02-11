import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function clean(v: unknown) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // accepte plusieurs noms au cas où (sécurise les futures modifs)
    const stageName =
      clean(body.stageName) || clean(body.name) || clean(body.djName) || clean(body.artistName);

    if (!stageName) {
      return NextResponse.json(
        { ok: false, error: "Nom d'artiste (stageName) requis." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const created = await prisma.application.create({
      data: {
        stageName,
        instagram: clean(body.instagram),
        setUrl: clean(body.setUrl),
        mediaUrl: clean(body.mediaUrl),
        email: clean(body.email),
        description: clean(body.description),
        // published false par défaut (validation admin)
        published: false,
      },
    });

    return NextResponse.json(
      { ok: true, application: created },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error("POST /api/applications", e);
    return NextResponse.json(
      { ok: false, error: "Impossible de créer la candidature", details: String(e?.message ?? e) },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function GET() {
  try {
    const apps = await prisma.application.findMany({
      where: { published: true },
      include: { _count: { select: { votes: true } } },
      orderBy: { createdAt: "desc" },
    });

    // tri votes desc puis date desc (safe)
    const sorted = apps.sort((a, b) => {
      const dv = (b._count?.votes ?? 0) - (a._count?.votes ?? 0);
      if (dv !== 0) return dv;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(
      { ok: true, applications: sorted },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e) {
    console.error("GET /api/applications", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}
