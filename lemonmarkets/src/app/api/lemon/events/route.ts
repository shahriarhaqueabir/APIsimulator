import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { lemonApi } from "@/lib/lemon-client";
import { db } from "@/lib/db";
import { apiHandler } from "@/lib/api-handler";
import { toSnakeCase } from "@/lib/demo-transform";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};
  const spaceId = searchParams.get("space_id");
  const type = searchParams.get("type");
  if (spaceId) params.space_id = spaceId;
  if (type) params.type = type;

  return apiHandler({
    demoFetcher: () => db.event.findMany({ orderBy: { createdAt: "desc" } }),
    apiFetcher: () => lemonApi.getEvents({ ...params }),
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.LEMON_MARKETS_API_KEY) {
    try {
      const body = await request.json();
      const { space_id, type, payload } = body;
      if (!space_id || !type) {
        return NextResponse.json(
          { ok: false, message: "space_id, type are required" },
          { status: 400 },
        );
      }
      const event = await db.event.create({
        data: {
          id: crypto.randomUUID(),
          spaceId: space_id,
          type,
          payload: JSON.stringify(payload || {}),
          createdAt: new Date(),
        },
      });
      return NextResponse.json(
        { ok: true, data: toSnakeCase(event as Record<string, unknown>) },
        { status: 201 },
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ ok: false, message }, { status: 500 });
    }
  }
  return NextResponse.json(
    { ok: false, message: "Live API not supported" },
    { status: 501 },
  );
}
