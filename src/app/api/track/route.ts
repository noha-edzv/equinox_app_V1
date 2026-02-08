import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { path } = await req.json();
  if (!path || typeof path !== "string") return NextResponse.json({ ok: false }, { status: 400 });

  await prisma.visit.create({ data: { path } });
  return NextResponse.json({ ok: true });
}
