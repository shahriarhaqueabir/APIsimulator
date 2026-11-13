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
  const status = searchParams.get("status");
  if (spaceId) params.space_id = spaceId;
  if (status) params.status = status;

  return apiHandler({
    demoFetcher: () => db.document.findMany({ orderBy: { createdAt: "desc" } }),
    apiFetcher: () => lemonApi.getDocuments({ ...params }),
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.LEMON_MARKETS_API_KEY) {
    try {
      const body = await request.json();
      const { space_id, type, status } = body;
      if (!space_id || !type || !status) {
        return NextResponse.json(
          { ok: false, message: "space_id, type, status are required" },
          { status: 400 },
        );
      }
      const doc = await db.document.create({
        data: {
          id: crypto.randomUUID(),
          spaceId: space_id,
          type,
          status,
          rejectReason: body.reject_reason || null,
          createdAt: new Date(),
        },
      });
      return NextResponse.json(
        { ok: true, data: toSnakeCase(doc as Record<string, unknown>) },
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
