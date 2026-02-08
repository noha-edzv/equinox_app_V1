import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function clean(v: unknown) {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const stageName = clean(body.stageName);
    if (!stageName) {
      return NextResponse.json({ error: "stageName requis" }, { status: 400 });
    }

    const instagram = clean(body.instagram);
    const setUrl = clean(body.setUrl);
    const mediaUrl = clean(body.mediaUrl);
    const email = clean(body.email);

    const created = await prisma.application.create({
      data: {
        stageName,
        instagram,
        setUrl,
        mediaUrl,
        email,
        published: false,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Impossible de créer la candidature", details: String(e?.message ?? e) },
      { status: 400 }
    );
  }
}

export async function GET() {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(applications);
}
