import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Action = "list" | "publish" | "unpublish" | "delete";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedParam = searchParams.get("published"); // "true" | "false" | null

    const where =
      publishedParam === "true"
        ? { published: true }
        : publishedParam === "false"
        ? { published: false }
        : {}; // tout

    const apps = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true } } },
    });

    // tri votes desc puis date desc (safe)
    const sorted = apps.sort((a, b) => {
      const dv = (b._count?.votes ?? 0) - (a._count?.votes ?? 0);
      if (dv !== 0) return dv;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ ok: true, applications: sorted });
  } catch (e) {
    console.error("GET /api/admin", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action: Action = body?.action;
    const id = String(body?.id ?? "");

    if (!action) {
      return NextResponse.json({ ok: false, error: "action manquante" }, { status: 400 });
    }

    if (action !== "list" && !id) {
      return NextResponse.json({ ok: false, error: "id manquant" }, { status: 400 });
    }

    if (action === "publish") {
      const updated = await prisma.application.update({
        where: { id },
        data: { published: true },
      });
      return NextResponse.json({ ok: true, application: updated });
    }

    if (action === "unpublish") {
      const updated = await prisma.application.update({
        where: { id },
        data: { published: false },
      });
      return NextResponse.json({ ok: true, application: updated });
    }

    if (action === "delete") {
      // Optionnel : supprime d'abord les votes liés si ta DB n'a pas cascade
      await prisma.vote.deleteMany({ where: { applicationId: id } });
      await prisma.application.delete({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    // list via POST si tu veux, sinon ignore
    if (action === "list") {
      const apps = await prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { votes: true } } },
      });
      return NextResponse.json({ ok: true, applications: apps });
    }

    return NextResponse.json({ ok: false, error: "action inconnue" }, { status: 400 });
  } catch (e) {
    console.error("POST /api/admin", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
