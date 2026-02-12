import { NextResponse } from "next/server";

export async function GET() {
  const v = process.env.DATABASE_URL;
  return NextResponse.json({
    hasDatabaseUrl: !!v,
    startsWithPostgres: typeof v === "string" && (v.startsWith("postgresql://") || v.startsWith("postgres://")),
    length: typeof v === "string" ? v.length : 0,
  });
}
