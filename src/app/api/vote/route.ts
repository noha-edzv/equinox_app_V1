export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "0.0.0.0";
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

function makeVoterKey(req: Request) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") ?? "";
  const salt = process.env.VOTE_SALT ?? "dev-salt";

  // 1 vote / jour
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  return crypto
    .createHash("sha256")
    .update(`${ip}|${ua}|${day}|${salt}`)
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const applicationId = String(body?.applicationId || "");

    if (!applicationId) {
      return NextResponse.json({ ok: false, error: "applicationId manquant" }, { status: 400 });
    }

    // Vérifie que le candidat existe + est publié
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app || !app.published) {
      return NextResponse.json({ ok: false, error: "Candidat introuvable" }, { status: 404 });
    }

    const voterKey = makeVoterKey(req);

    // Create vote (si déjà voté aujourd'hui => unique constraint)
    try {
      await prisma.vote.create({ data: { applicationId, voterKey } });
    } catch (err: any) {
      // Prisma unique constraint
      if (err?.code === "P2002") {
        return NextResponse.json({ ok: false, error: "Déjà voté aujourd’hui" }, { status: 409 });
      }
      throw err;
    }

    // renvoie le nouveau compteur
    const count = await prisma.vote.count({ where: { applicationId } });

    return NextResponse.json({ ok: true, votes: count });
  } catch (e) {
    console.error("POST /api/vote", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
