export const runtime = "nodejs";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const applicationId = String(body?.applicationId || "");

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId manquant" }, { status: 400 });
    }

    // Vérifie que le candidat existe + est publié
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || !app.published) {
      return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
    }

    await prisma.vote.create({ data: { applicationId } });

    // renvoie le nouveau compteur
    const count = await prisma.vote.count({ where: { applicationId } });

    return NextResponse.json({ ok: true, votes: count });
  } catch (e) {
    console.error("POST /api/vote", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
