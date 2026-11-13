import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { lemonApi } from "@/lib/lemon-client";
import { db } from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { toSnakeCase } from "@/lib/demo-transform";

export async function GET() {
  return apiHandler({
    demoFetcher: () => db.space.findMany({ orderBy: { createdAt: "desc" } }),
    apiFetcher: () => lemonApi.getSpaces(),
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.LEMON_MARKETS_API_KEY) {
    try {
      const body = await request.json();
      const { name } = body;
      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { ok: false, message: "name is required" },
          { status: 400 },
        );
      }
      const space = await db.space.create({
        data: { id: crypto.randomUUID(), name },
      });
      return NextResponse.json(
        { ok: true, data: toSnakeCase(space as Record<string, unknown>) },
        { status: 201 },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }
  }
  return NextResponse.json(
    { ok: false, message: "Live API not supported for this operation" },
    { status: 501 },
  );
}
