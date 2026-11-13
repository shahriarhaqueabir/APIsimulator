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
    demoFetcher: () => db.order.findMany({ orderBy: { createdAt: "desc" } }),
    apiFetcher: () => lemonApi.getOrders({ ...params }),
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.LEMON_MARKETS_API_KEY) {
    try {
      const body = await request.json();
      const { space_id, isin, side, quantity, limit_price } = body;
      if (!space_id || !isin || !side || !quantity) {
        return NextResponse.json(
          { ok: false, message: "space_id, isin, side, quantity are required" },
          { status: 400 },
        );
      }
      if (!["buy", "sell"].includes(side)) {
        return NextResponse.json(
          { ok: false, message: "side must be 'buy' or 'sell'" },
          { status: 400 },
        );
      }
      const order = await db.order.create({
        data: {
          id: crypto.randomUUID(),
          spaceId: space_id,
          isin,
          side,
          quantity,
          limitPrice: limit_price || null,
          status: "open",
          createdAt: new Date(),
        },
      });
      return NextResponse.json(
        { ok: true, data: toSnakeCase(order as Record<string, unknown>) },
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
